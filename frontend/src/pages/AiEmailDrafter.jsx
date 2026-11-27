import { useState } from 'react';
import { Form, Input, Select, Button, Card, Row, Col, message, Typography, Empty } from 'antd';
import {
  ThunderboltOutlined,
  MailOutlined,
  CopyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

export default function AiEmailDrafter() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [formValues, setFormValues] = useState({});

  const generate = async (values) => {
    setFormValues(values);
    setLoading(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/email',
        {
          customerName: values.customerName,
          customerEmail: values.customerEmail,
          context: values.context,
          tone: values.tone || 'professional',
        },
        { headers: getAuthHeaders() }
      );
      setEmailData(data.result);
      message.success('Email generated successfully!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to generate email');
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = () => {
    if (!emailData) return;
    const full = `Subject: ${emailData.subject}\n\n${emailData.greeting}\n\n${emailData.body}\n\n${emailData.closing}`;
    navigator.clipboard.writeText(full);
    message.success('Email copied to clipboard!');
  };

  const regenerate = () => {
    if (formValues.customerName) generate(formValues);
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #1E3A5F 100%)',
          borderRadius: 14,
          padding: '28px 32px',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          ✉️ AI Email Drafter
        </Title>
        <Text style={{ color: '#94A3B8', fontSize: 13 }}>
          Generate professional emails for your customers in seconds
        </Text>
      </div>

      <Row gutter={24}>
        {/* Input Form */}
        <Col xs={24} lg={10}>
          <Card
            style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            bodyStyle={{ padding: 24 }}
          >
            <Title level={5} style={{ marginBottom: 20 }}>
              Email Details
            </Title>
            <Form form={form} layout="vertical" onFinish={generate}>
              <Form.Item
                label="Customer Name"
                name="customerName"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="e.g., John Smith" />
              </Form.Item>
              <Form.Item label="Customer Email" name="customerEmail">
                <Input placeholder="e.g., john@acme.com" type="email" />
              </Form.Item>
              <Form.Item
                label="Purpose / Context"
                name="context"
                rules={[{ required: true, message: 'Required' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="e.g., Payment reminder for Invoice #1234 of ₹25,000 due on Dec 1st"
                />
              </Form.Item>
              <Form.Item label="Tone" name="tone" initialValue="professional">
                <Select
                  options={[
                    { value: 'professional', label: '🏢 Professional' },
                    { value: 'friendly', label: '😊 Friendly' },
                    { value: 'firm', label: '💼 Firm' },
                    { value: 'casual', label: '✌️ Casual' },
                  ]}
                />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<ThunderboltOutlined />}
                loading={loading}
                block
                size="large"
                style={{
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  border: 'none',
                  fontWeight: 600,
                  height: 46,
                }}
              >
                Generate Email
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Preview */}
        <Col xs={24} lg={14}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              minHeight: 420,
            }}
            bodyStyle={{ padding: 0 }}
          >
            {emailData ? (
              <div>
                {/* Email header */}
                <div
                  style={{
                    background: '#F8FAFC',
                    padding: '18px 24px',
                    borderBottom: '1px solid #E2E8F0',
                    borderRadius: '12px 12px 0 0',
                  }}
                >
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>SUBJECT</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
                    {emailData.subject}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: '#64748B' }}>
                    <div>
                      <strong>From:</strong> AccessoHub &lt;noreply@accessohub.com&gt;
                    </div>
                    <div>
                      <strong>To:</strong>{' '}
                      {formValues.customerEmail || formValues.customerName}
                    </div>
                  </div>
                </div>
                {/* Email body */}
                <div style={{ padding: '24px', lineHeight: 1.75, color: '#334155', fontSize: 14 }}>
                  <div style={{ marginBottom: 12 }}>{emailData.greeting}</div>
                  <div style={{ whiteSpace: 'pre-wrap', marginBottom: 16 }}>{emailData.body}</div>
                  <div>{emailData.closing}</div>
                </div>
                {/* Actions */}
                <div
                  style={{
                    padding: '14px 24px',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <Button icon={<CopyOutlined />} onClick={copyEmail}>
                    Copy to Clipboard
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={regenerate} loading={loading}>
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 400,
                  color: '#94A3B8',
                }}
              >
                <MailOutlined style={{ fontSize: 56, marginBottom: 16, color: '#CBD5E1' }} />
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
                  No Email Generated Yet
                </div>
                <div style={{ fontSize: 12 }}>
                  Fill in the details and click &quot;Generate Email&quot;
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
