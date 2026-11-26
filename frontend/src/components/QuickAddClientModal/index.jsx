import { useState } from 'react';
import { Modal, Form, Input, Segmented, Row, Col } from 'antd';
import { ShopOutlined, ShoppingOutlined } from '@ant-design/icons';
import { request } from '@/request';

export default function QuickAddClientModal({ open, onClose, onCreated }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await request.create({ entity: 'client', jsonData: values });
      setLoading(false);
      if (res?.success && res?.result) {
        form.resetFields();
        onCreated?.(res.result);
        onClose();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Quick Add Customer"
      okText="Save & Select Customer"
      cancelText="Cancel"
      confirmLoading={loading}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ category: 'retail', status: 'active', country: 'India' }}
      >
        <Form.Item
          name="name"
          label="Customer Name"
          rules={[{ required: true, message: 'Customer name is required' }]}
        >
          <Input placeholder="e.g. Rajesh Traders" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="company" label="Company">
              <Input placeholder="Company / Shop Name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="category" label="Customer Category">
              <Segmented
                block
                options={[
                  {
                    label: (
                      <span>
                        <ShoppingOutlined /> Retail
                      </span>
                    ),
                    value: 'retail',
                  },
                  {
                    label: (
                      <span>
                        <ShopOutlined /> Wholesale
                      </span>
                    ),
                    value: 'wholesale',
                  },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="+91 98XXXXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Enter a valid email' }]}
            >
              <Input placeholder="customer@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input placeholder="City / Street address" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
