import { useMemo } from 'react';
import { Form, Input, InputNumber, Row, Col, AutoComplete } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';

export default function ItemRow({
  field,
  remove,
  products = [],
  saleType = 'retail',
}) {
  const money = useMoney();
  const form = Form.useFormInstance();

  const watchedPrice = Form.useWatch(['items', field.name, 'price'], form);
  const watchedQuantity = Form.useWatch(['items', field.name, 'quantity'], form);

  const totalState = useMemo(() => {
    const p = Number(watchedPrice) || 0;
    const q = Number(watchedQuantity) || 0;
    return calculate.multiply(p, q);
  }, [watchedPrice, watchedQuantity]);

  const productOptions = useMemo(() => {
    return products.map((prod) => {
      const activeRate =
        saleType === 'wholesale'
          ? prod.wholesalePrice ?? prod.retailPrice ?? prod.price ?? 0
          : prod.retailPrice ?? prod.price ?? prod.wholesalePrice ?? 0;

      return {
        value: prod.name,
        product: prod,
        label: (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span>
              <strong>{prod.name}</strong>
              {prod.ref ? ` (${prod.ref})` : ''}
            </span>
            <span style={{ color: '#64748B', fontSize: 12 }}>
              {money.moneyFormatter({ amount: activeRate })}
            </span>
          </div>
        ),
      };
    });
  }, [products, saleType, money]);

  const handleProductSelect = (_, option) => {
    const prod = option?.product;
    if (!prod || !form) return;

    const rate =
      saleType === 'wholesale'
        ? prod.wholesalePrice ?? prod.retailPrice ?? prod.price ?? 0
        : prod.retailPrice ?? prod.price ?? prod.wholesalePrice ?? 0;

    const currentItems = [...(form.getFieldValue('items') || [])];
    const row = { ...(currentItems[field.name] || {}) };
    const qty = Number(row.quantity) > 0 ? Number(row.quantity) : 1;

    currentItems[field.name] = {
      ...row,
      itemName: prod.name,
      description: row.description || prod.description || '',
      quantity: qty,
      price: rate,
      total: calculate.multiply(qty, rate),
    };

    form.setFieldValue('items', currentItems);
  };

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Missing item name',
            },
            {
              pattern: /^(?!\s*$)[\s\S]+$/,
              message: 'Item Name must contain alphanumeric or special characters',
            },
          ]}
        >
          {products.length > 0 ? (
            <AutoComplete
              options={productOptions}
              onSelect={handleProductSelect}
              filterOption={(inputValue, option) =>
                option?.value?.toLowerCase().includes(inputValue.toLowerCase())
              }
              placeholder="Select or type item"
            />
          ) : (
            <Input placeholder="Item Name" />
          )}
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={7}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="Description" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            className="moneyInput"
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item>
          <InputNumber
            readOnly
            className="moneyInput"
            value={totalState}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
            formatter={(value) =>
              money.amountFormatter({ amount: value, currency_code: money.currency_code })
            }
          />
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: '5px', cursor: 'pointer' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
