import { useState } from 'react';
import { Button, Card, Table, Tag, Row, Col, Typography, message, List } from 'antd';
import {
  ThunderboltOutlined,
  WarningOutlined,
  ExperimentOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { Title, Text, Paragraph } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

const RISK_COLORS = { low: 'green', medium: 'orange', high: 'red' };
const RISK_ORDER = { high: 0, medium: 1, low: 2 };

export default function AiPaymentPrediction() {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);

  const analyze = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      // Fetch invoice list
      const listRes = await axios.get(API_BASE_URL + 'invoice/list', { headers });
      const rawInvoices =
        listRes.data?.result?.result || listRes.data?.result || listRes.data || [];

      if (!Array.isArray(rawInvoices) || rawInvoices.length === 0) {
        message.info('No invoices found to analyze. Add some invoices first.');
        setLoading(false);
        return;
      }

      const invoices = rawInvoices.slice(0, 20).map((inv) => ({
        invoiceId: inv.number || inv._id || inv.id,
        client: inv.client?.name || inv.client || 'Unknown',
        amount: inv.total || inv.subTotal || 0,
        dueDate: inv.expiredDate || inv.date || new Date().toISOString(),
        status: inv.status || 'draft',
        daysSinceCreation: Math.floor(
          (Date.now() - new Date(inv.created || inv.date || Date.now()).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }));

      const { data } = await axios.post(
        API_BASE_URL + 'ai/predictions',
        { invoices },
        { headers }
      );
      setPredictions(data.result);
      message.success('Analysis complete!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to analyze invoices');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      width: '20%',
      render: (v) => <Text strong>{v}</Text>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: '15%',
      align: 'right',
      render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`,
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'risk',
      width: '14%',
      align: 'center',
      sorter: (a, b) =>
        (RISK_ORDER[a.riskLevel] ?? 3) - (RISK_ORDER[b.riskLevel] ?? 3),
      defaultSortOrder: 'ascend',
      render: (risk) => (
        <Tag
          color={RISK_COLORS[risk] || 'default'}
          style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 11 }}
        >
          {risk}
        </Tag>
      ),
    },
    {
      title: 'Predicted Pay Date',
      dataIndex: 'predictedPayDate',
      key: 'payDate',
      width: '18%',
      align: 'center',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: '33%',
      render: (v) => <span style={{ color: '#64748B', fontSize: 12.5 }}>{v}</span>,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #1E3A5F 100%)',
          borderRadius: 14,
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            🔮 AI Payment Predictions
          </Title>
          <Text style={{ color: '#94A3B8', fontSize: 13 }}>
            Predict which invoices are at risk of late payment
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={analyze}
          loading={loading}
          style={{
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            border: 'none',
            fontWeight: 600,
            height: 46,
          }}
        >
          {predictions ? 'Re-Analyze' : 'Analyze Invoices'}
        </Button>
      </div>

      {!loading && predictions && (
        <div>
          {/* Overall Risk */}
          <Card
            style={{
              borderRadius: 12,
              marginBottom: 24,
              borderLeft: '4px solid #F59E0B',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertOutlined style={{ fontSize: 22, color: '#D97706' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>
                  OVERALL RISK ASSESSMENT
                </div>
                <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 1.6 }}>
                  {predictions.overallRisk}
                </div>
              </div>
            </div>
          </Card>

          {/* Predictions Table */}
          <Card
            style={{
              borderRadius: 12,
              marginBottom: 24,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: '18px 24px 0' }}>
              <Title level={5} style={{ margin: 0 }}>
                Invoice Risk Analysis
              </Title>
            </div>
            <Table
              columns={columns}
              dataSource={(predictions.predictions || []).map((p, i) => ({ ...p, key: i }))}
              pagination={false}
              size="middle"
              style={{ padding: '0 8px 16px' }}
            />
          </Card>

          {/* Action Items */}
          {predictions.actionItems && predictions.actionItems.length > 0 && (
            <Card
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>
                ⚡ Recommended Actions
              </Title>
              {predictions.actionItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom:
                      i < predictions.actionItems.length - 1 ? '1px solid #F1F5F9' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#FEE2E2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <WarningOutlined style={{ fontSize: 13, color: '#EF4444' }} />
                  </div>
                  <div
                    style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, paddingTop: 3 }}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {!loading && !predictions && (
        <Card
          style={{
            borderRadius: 12,
            textAlign: 'center',
            padding: '60px 0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <ExperimentOutlined style={{ fontSize: 56, color: '#CBD5E1', marginBottom: 16 }} />
          <div style={{ fontSize: 15, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
            No Analysis Yet
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>
            Click &quot;Analyze Invoices&quot; to predict payment risks
          </div>
        </Card>
      )}
    </div>
  );
}
