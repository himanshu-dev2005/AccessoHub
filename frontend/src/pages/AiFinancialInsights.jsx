import { useState } from 'react';
import { Button, Card, Row, Col, Typography, message, Skeleton, Tag } from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const { Title, Text, Paragraph } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

const ICON_MAP = {
  positive: <CheckCircleOutlined style={{ fontSize: 28, color: '#10B981' }} />,
  warning: <WarningOutlined style={{ fontSize: 28, color: '#F59E0B' }} />,
  info: <InfoCircleOutlined style={{ fontSize: 28, color: '#3B82F6' }} />,
};

const BORDER_MAP = {
  positive: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export default function AiFinancialInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      // Fetch summaries from existing endpoints
      const [invoiceRes, paymentRes, productRes, clientRes] = await Promise.allSettled([
        axios.get(API_BASE_URL + 'invoice/summary', { headers }),
        axios.get(API_BASE_URL + 'payment/summary', { headers }),
        axios.get(API_BASE_URL + 'product/summary', { headers }),
        axios.get(API_BASE_URL + 'client/summary', { headers }),
      ]);

      const extractData = (res) =>
        res.status === 'fulfilled' ? res.value.data?.result || res.value.data || {} : {};

      const businessData = {
        invoices: extractData(invoiceRes),
        payments: extractData(paymentRes),
        products: extractData(productRes),
        customers: extractData(clientRes),
      };

      const { data } = await axios.post(
        API_BASE_URL + 'ai/insights',
        { data: businessData },
        { headers }
      );
      setInsights(data.result);
      message.success('Insights generated!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to generate insights');
    } finally {
      setLoading(false);
    }
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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            📊 AI Financial Insights
          </Title>
          <Text style={{ color: '#94A3B8', fontSize: 13 }}>
            AI-powered analysis of your business performance
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={generate}
          loading={loading}
          style={{
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            border: 'none',
            fontWeight: 600,
            height: 46,
          }}
        >
          {insights ? 'Refresh Insights' : 'Generate Insights'}
        </Button>
      </div>

      {loading && (
        <div>
          <Skeleton active paragraph={{ rows: 3 }} style={{ marginBottom: 24 }} />
          <Row gutter={[16, 16]}>
            {[1, 2, 3].map((i) => (
              <Col key={i} xs={24} md={8}>
                <Card style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {!loading && insights && (
        <div>
          {/* Summary */}
          <Card
            style={{
              borderRadius: 12,
              marginBottom: 24,
              borderLeft: '4px solid #2563EB',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BarChartOutlined style={{ fontSize: 22, color: '#2563EB' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#94A3B8', fontWeight: 600, marginBottom: 6 }}>
                  EXECUTIVE SUMMARY
                </div>
                <Paragraph style={{ fontSize: 15, color: '#1E293B', margin: 0, lineHeight: 1.7 }}>
                  {insights.summary}
                </Paragraph>
              </div>
            </div>
          </Card>

          {/* Insights Grid */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {(insights.insights || []).map((insight, i) => (
              <Col key={i} xs={24} md={8}>
                <Card
                  style={{
                    borderRadius: 12,
                    height: '100%',
                    borderLeft: `4px solid ${BORDER_MAP[insight.type] || '#3B82F6'}`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ marginBottom: 12 }}>
                    {ICON_MAP[insight.type] || ICON_MAP.info}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 8 }}>
                    {insight.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                    {insight.description}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <Card
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>
                💡 Recommendations
              </Title>
              {insights.recommendations.map((rec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom:
                      i < insights.recommendations.length - 1
                        ? '1px solid #F1F5F9'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#FEF3C7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#D97706',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, paddingTop: 3 }}>
                    {rec}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {!loading && !insights && (
        <Card
          style={{
            borderRadius: 12,
            textAlign: 'center',
            padding: '60px 0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <BarChartOutlined style={{ fontSize: 56, color: '#CBD5E1', marginBottom: 16 }} />
          <div style={{ fontSize: 15, fontWeight: 500, color: '#64748B', marginBottom: 6 }}>
            No Insights Generated Yet
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8' }}>
            Click &quot;Generate Insights&quot; to get AI-powered analysis of your business data
          </div>
        </Card>
      )}
    </div>
  );
}
