import { useState } from 'react';
import { Input, Button, Card, Table, Typography, message, Row, Col, Statistic } from 'antd';
import {
  ThunderboltOutlined,
  FileTextOutlined,
  CopyOutlined,
  ReloadOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { Title, Text } = Typography;
const { TextArea } = Input;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

export default function AiSmartInvoice() {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const generate = async () => {
    if (!description.trim()) {
      message.warning('Please describe your invoice first');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/invoice',
        { description },
        { headers: getAuthHeaders() }
      );
      setInvoiceData(data.result);
      message.success('Invoice data extracted!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Item', dataIndex: 'name', key: 'name', width: '25%' },
    { title: 'Description', dataIndex: 'description', key: 'desc', width: '30%' },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'qty',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      align: 'right',
      render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`,
    },
    {
      title: 'Total',
      key: 'total',
      width: '20%',
      align: 'right',
      render: (_, r) => `₹${(Number(r.quantity || 0) * Number(r.price || 0)).toLocaleString('en-IN')}`,
    },
  ];

  const subtotal = invoiceData
    ? invoiceData.items.reduce((s, r) => s + Number(r.quantity || 0) * Number(r.price || 0), 0)
    : 0;
  const tax = invoiceData ? subtotal * ((invoiceData.taxRate || 0) / 100) : 0;
  const grandTotal = subtotal + tax;

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(invoiceData, null, 2));
    message.success('Invoice data copied!');
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
          📝 AI Smart Invoice
        </Title>
        <Text style={{ color: '#94A3B8', fontSize: 13 }}>
          Describe your invoice in plain English and let AI create it
        </Text>
      </div>

      {/* Input */}
      <Card
        style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <TextArea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='e.g., "Create an invoice for Acme Corp for 5 units of Widget Pro at ₹2,500 each, 3 units of Bolt Kit at ₹800 each, 18% GST"'
          style={{ fontSize: 14, borderRadius: 10, marginBottom: 16 }}
        />
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={generate}
          loading={loading}
          size="large"
          style={{
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            border: 'none',
            fontWeight: 600,
            height: 46,
          }}
        >
          Generate Invoice
        </Button>
      </Card>

      {/* Result */}
      {invoiceData ? (
        <Card
          style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
          bodyStyle={{ padding: 0 }}
        >
          {/* Invoice header */}
          <div
            style={{
              padding: '24px 28px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>
                Invoice For
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
                {invoiceData.client}
              </div>
            </div>
            <div
              style={{
                padding: '6px 14px',
                background: '#EFF6FF',
                borderRadius: 8,
                color: '#2563EB',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              AI Generated
            </div>
          </div>

          {/* Items table */}
          <div style={{ padding: '0 28px' }}>
            <Table
              columns={columns}
              dataSource={invoiceData.items.map((item, i) => ({ ...item, key: i }))}
              pagination={false}
              size="middle"
              style={{ marginBottom: 0 }}
            />
          </div>

          {/* Totals */}
          <div
            style={{
              padding: '20px 28px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ width: 280 }}>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: '#64748B' }}>Subtotal</Text>
                <Text>₹{subtotal.toLocaleString('en-IN')}</Text>
              </Row>
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Text style={{ color: '#64748B' }}>Tax ({invoiceData.taxRate || 0}%)</Text>
                <Text>₹{tax.toLocaleString('en-IN')}</Text>
              </Row>
              <Row
                justify="space-between"
                style={{
                  borderTop: '2px solid #0F172A',
                  paddingTop: 10,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: 700 }}>Grand Total</Text>
                <Text style={{ fontSize: 18, fontWeight: 800, color: '#2563EB' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </Text>
              </Row>
            </div>
          </div>

          {invoiceData.notes && (
            <div style={{ padding: '0 28px 20px', color: '#64748B', fontSize: 13 }}>
              <strong>Notes:</strong> {invoiceData.notes}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              padding: '14px 28px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 10,
            }}
          >
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => navigate('/invoice/create')}
              style={{ borderRadius: 8 }}
            >
              Create Invoice
            </Button>
            <Button icon={<CopyOutlined />} onClick={copyData} style={{ borderRadius: 8 }}>
              Copy Data
            </Button>
            <Button icon={<ReloadOutlined />} onClick={generate} loading={loading} style={{ borderRadius: 8 }}>
              Regenerate
            </Button>
          </div>
        </Card>
      ) : (
        !loading && (
          <Card
            style={{
              borderRadius: 12,
              textAlign: 'center',
              padding: '60px 0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <FileTextOutlined style={{ fontSize: 56, color: '#CBD5E1', marginBottom: 16 }} />
            <div style={{ fontSize: 15, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
              No Invoice Generated Yet
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              Describe your invoice above and click &quot;Generate Invoice&quot;
            </div>
          </Card>
        )
      )}
    </div>
  );
}
