import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Divider,
  Row,
  Col,
  Card,
  Segmented,
  Tag,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EyeInvisibleOutlined,
  ShopOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { DatePicker } from 'antd';

import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import QuickAddClientModal from '@/components/QuickAddClientModal';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { request } from '@/request';

const { Text } = Typography;

export default function InvoiceForm({ subTotal = 0, current = null }) {
  const { last_invoice_number } = useSelector(selectFinanceSettings);

  if (last_invoice_number === undefined) {
    return <></>;
  }

  return <LoadInvoiceForm subTotal={subTotal} current={current} />;
}

function LoadInvoiceForm({ subTotal = 0, current = null }) {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { last_invoice_number } = useSelector(selectFinanceSettings);
  const form = Form.useFormInstance();
  const selectedClient = Form.useWatch('client', form);
  const saleType = Form.useWatch('saleType', form) || 'retail';

  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [lastNumber, setLastNumber] = useState(() => last_invoice_number + 1);
  const [products, setProducts] = useState([]);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [injectedClient, setInjectedClient] = useState(null);
  const prevSaleTypeRef = useRef(saleType);

  const handelTaxChange = (value) => {
    setTaxRate((Number(value) || 0) / 100);
  };

  useEffect(() => {
    request.listAll({ entity: 'product' }).then((res) => {
      if (res?.success && Array.isArray(res.result)) {
        setProducts(res.result);
      }
    });
  }, []);

  useEffect(() => {
    if (current) {
      const { taxRate = 0, year, number, saleType: currentSaleType } = current;
      setTaxRate(taxRate / 100);
      setCurrentYear(year);
      setLastNumber(number);
      if (currentSaleType) {
        prevSaleTypeRef.current = currentSaleType;
      }
    }
  }, [current]);

  useEffect(() => {
    if (
      !current &&
      selectedClient &&
      typeof selectedClient === 'string' &&
      selectedClient !== 'redirectURL'
    ) {
      request.read({ entity: 'client', id: selectedClient }).then((res) => {
        const cat = res?.result?.category;
        if (cat === 'wholesale' || cat === 'retail') {
          form?.setFieldValue('saleType', cat);
        }
      });
    }
  }, [selectedClient, current, form]);

  useEffect(() => {
    if (prevSaleTypeRef.current === saleType || products.length === 0 || !form) {
      prevSaleTypeRef.current = saleType;
      return;
    }
    prevSaleTypeRef.current = saleType;

    const currentItems = form.getFieldValue('items');
    if (!Array.isArray(currentItems) || currentItems.length === 0) return;

    let changed = false;
    const syncedItems = currentItems.map((row) => {
      if (!row?.itemName) return row;
      const matched = products.find(
        (p) => p.name?.toLowerCase() === String(row.itemName).trim().toLowerCase()
      );
      if (!matched) return row;
      const nextRate =
        saleType === 'wholesale'
          ? matched.wholesalePrice ?? matched.retailPrice ?? matched.price ?? 0
          : matched.retailPrice ?? matched.price ?? matched.wholesalePrice ?? 0;
      const qty = Number(row.quantity) || 0;
      changed = true;
      return {
        ...row,
        price: nextRate,
        total: calculate.multiply(qty, nextRate),
      };
    });

    if (changed) {
      form.setFieldValue('items', syncedItems);
    }
  }, [saleType, products, form]);

  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(calculate.multiply(subTotal, taxRate)));
    setTotal(Number.parseFloat(currentTotal));
  }, [subTotal, taxRate]);

  const addField = useRef(false);

  useEffect(() => {
    if (!current && addField.current) {
      addField.current.click();
    }
  }, [current]);

  const handleQuickClientCreated = (newClient) => {
    setInjectedClient(newClient);
    form?.setFieldValue('client', newClient._id);
    if (newClient.category === 'wholesale' || newClient.category === 'retail') {
      form?.setFieldValue('saleType', newClient.category);
    }
  };

  return (
    <>
      <Row gutter={[24, 24]} align="top">
        <Col xs={24} lg={18}>
          <Row gutter={[12, 0]}>
            <Col className="gutter-row" span={9}>
              <Form.Item
                name="client"
                label={translate('Client')}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <AutoCompleteAsync
                  entity={'client'}
                  displayLabels={['name']}
                  searchFields={'name'}
                  redirectLabel={'Add New Client'}
                  withRedirect
                  onQuickAdd={() => setQuickClientOpen(true)}
                  injectedOption={injectedClient}
                />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('number')}
                name="number"
                initialValue={lastNumber}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('year')}
                name="year"
                initialValue={currentYear}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={5}>
              <Form.Item
                label={translate('status')}
                name="status"
                rules={[
                  {
                    required: false,
                  },
                ]}
                initialValue={'draft'}
              >
                <Select
                  options={[
                    { value: 'draft', label: translate('Draft') },
                    { value: 'pending', label: translate('Pending') },
                    { value: 'sent', label: translate('Sent') },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col className="gutter-row" span={8}>
              <Form.Item
                name="date"
                label={translate('Date')}
                rules={[
                  {
                    required: true,
                    type: 'object',
                  },
                ]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={6}>
              <Form.Item
                name="expiredDate"
                label={translate('Expire Date')}
                rules={[
                  {
                    required: true,
                    type: 'object',
                  },
                ]}
                initialValue={dayjs().add(30, 'days')}
              >
                <DatePicker style={{ width: '100%' }} format={dateFormat} />
              </Form.Item>
            </Col>
            <Col className="gutter-row" span={10}>
              <Form.Item label={translate('Note')} name="notes">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Divider dashed />
          <Row gutter={[12, 12]} style={{ position: 'relative' }}>
            <Col className="gutter-row" span={5}>
              <p>{translate('Item')}</p>
            </Col>
            <Col className="gutter-row" span={7}>
              <p>{translate('Description')}</p>
            </Col>
            <Col className="gutter-row" span={3}>
              <p>{translate('Quantity')}</p>
            </Col>
            <Col className="gutter-row" span={4}>
              <p>{translate('Price')}</p>
            </Col>
            <Col className="gutter-row" span={5}>
              <p>{translate('Total')}</p>
            </Col>
          </Row>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <ItemRow
                    key={field.key}
                    remove={remove}
                    field={field}
                    current={current}
                    products={products}
                    saleType={saleType}
                  />
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    ref={addField}
                  >
                    {translate('Add field')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Divider dashed />
          <div style={{ position: 'relative', width: '100%', float: 'right' }}>
            <Row gutter={[12, -5]}>
              <Col className="gutter-row" span={5}>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                    {translate('Save')}
                  </Button>
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={4} offset={10}>
                <p
                  style={{
                    paddingLeft: '12px',
                    paddingTop: '5px',
                    margin: 0,
                    textAlign: 'right',
                  }}
                >
                  {translate('Sub Total')} :
                </p>
              </Col>
              <Col className="gutter-row" span={5}>
                <MoneyInputFormItem readOnly value={subTotal} />
              </Col>
            </Row>
            <Row gutter={[12, -5]}>
              <Col className="gutter-row" span={4} offset={15}>
                <Form.Item
                  name="taxRate"
                  initialValue={0}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <SelectAsync
                    value={taxRate}
                    onChange={handelTaxChange}
                    entity={'taxes'}
                    outputValue={'taxValue'}
                    displayLabels={['taxName']}
                    withRedirect={true}
                    urlToRedirect="/taxes"
                    redirectLabel={translate('Add New Tax')}
                    placeholder={translate('Select Tax Value')}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={5}>
                <MoneyInputFormItem readOnly value={taxTotal} />
              </Col>
            </Row>
            <Row gutter={[12, -5]}>
              <Col className="gutter-row" span={4} offset={15}>
                <p
                  style={{
                    paddingLeft: '12px',
                    paddingTop: '5px',
                    margin: 0,
                    textAlign: 'right',
                  }}
                >
                  {translate('Total')} :
                </p>
              </Col>
              <Col className="gutter-row" span={5}>
                <MoneyInputFormItem readOnly value={total} />
              </Col>
            </Row>
          </div>
        </Col>

        <Col xs={24} lg={6}>
          <Card
            size="small"
            style={{
              borderRadius: 12,
              border: '1px solid #E2E8F0',
              background: '#F8FAFC',
              position: 'sticky',
              top: 24,
            }}
            title={
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                Invoice Side Option
              </span>
            }
            extra={
              <Tag icon={<EyeInvisibleOutlined />} color="default" style={{ marginRight: 0 }}>
                Hidden on Invoice
              </Tag>
            }
          >
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 12 }}>
              Slide between Retail &amp; Wholesale to auto-sync product rates on this invoice. Never
              shown on printed or PDF invoices.
            </Text>

            <Form.Item name="saleType" initialValue="retail" style={{ marginBottom: 12 }}>
              <Segmented
                block
                size="large"
                options={[
                  {
                    label: (
                      <span style={{ fontWeight: 600 }}>
                        <ShoppingOutlined /> Retail
                      </span>
                    ),
                    value: 'retail',
                  },
                  {
                    label: (
                      <span style={{ fontWeight: 600 }}>
                        <ShopOutlined /> Wholesale
                      </span>
                    ),
                    value: 'wholesale',
                  },
                ]}
              />
            </Form.Item>

            <div
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                background: saleType === 'wholesale' ? '#F3E8FF' : '#EFF6FF',
                color: saleType === 'wholesale' ? '#6B21A8' : '#1D4ED8',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              Active Rate Tier: <strong>{saleType === 'wholesale' ? 'Wholesale' : 'Retail'}</strong>
            </div>
          </Card>
        </Col>
      </Row>

      <QuickAddClientModal
        open={quickClientOpen}
        onClose={() => setQuickClientOpen(false)}
        onCreated={handleQuickClientCreated}
      />
    </>
  );
}
