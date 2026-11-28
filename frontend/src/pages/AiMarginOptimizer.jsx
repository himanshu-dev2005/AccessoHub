import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Typography, Row, Col, Statistic, Alert, Space, message } from 'antd';
import { FundProjectionScreenOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Title, Text } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

export default function AiMarginOptimizer() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [products, setProducts] = useState([]);
  const [aiAdvice, setAiAdvice] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await request.listAll({ entity: 'product' });
      const items = res?.result || [];
      const enriched = items.map((p) => {
        const retail = Number(p.retailPrice ?? p.price ?? 0);
        const wholesale = Number(p.wholesalePrice ?? 0);
        const cost = Number(p.purchaseCost ?? p.costPrice ?? 0);
        const margin = retail > 0 ? ((retail - cost) / retail) * 100 : 0;
        const profitPerUnit = retail - cost;
        return {
          key: p._id,
          name: p.name,
          ref: p.ref || '-',
          retailPrice: retail,
          wholesalePrice: wholesale,
          purchaseCost: cost,
          stock: Number(p.stock || 0),
          marginPct: Number(margin.toFixed(1)),
          profitPerUnit,
        };
      });
      enriched.sort((a, b) => a.marginPct - b.marginPct);
      setProducts(enriched);
    } catch {
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const runOptimizer = async () => {
    setAnalyzing(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/margin-optimizer',
        { products },
        { headers: getAuthHeaders() }
      );
      setAiAdvice(data.result);
      message.success('Margin & profit optimization complete!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to analyze margins');
    } finally {
      setAnalyzing(false);
    }
  };

  const avgMargin = products.length
    ? (products.reduce((s, p) => s + p.marginPct, 0) / products.length).toFixed(1)
    : 0;
  const lowMarginCount = products.filter((p) => p.marginPct < 15).length;
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const columns = [
    { title: 'Product', dataIndex: 'name', key: 'name', render: (v, r) => (<div><strong>{v}</strong><div style={{ fontSize: 12, color: '#64748b' }}>SKU: {r.ref}</div></div>) },
    { title: 'Cost', dataIndex: 'purchaseCost', key: 'purchaseCost', align: 'right', render: (v) => `₹${v.toLocaleString('en-IN')}` },
    { title: 'Retail', dataIndex: 'retailPrice', key: 'retailPrice', align: 'right', render: (v) => `₹${v.toLocaleString('en-IN')}` },
    { title: 'Profit / Unit', dataIndex: 'profitPerUnit', key: 'profitPerUnit', align: 'right', render: (v) => <Text type={v <= 0 ? 'danger' : 'success'}>₹{v.toLocaleString('en-IN')}</Text> },
    {
      title: 'Margin %',
      dataIndex: 'marginPct',
      key: 'marginPct',
      align: 'center',
      render: (m) => <Tag color={m < 10 ? 'red' : m < 25 ? 'orange' : 'green'}>{m}%</Tag>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      align: 'center',
      render: (s) => <Tag color={s <= 5 ? 'red' : 'blue'}>{s}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <FundProjectionScreenOutlined style={{ color: '#059669' }} />
            Smart Margin &amp; Profit Optimizer
          </Title>
          <Text type="secondary">
            Analyzes supplier purchase costs vs. retail/wholesale pricing to catch thin margins and low-stock risks.
          </Text>
        </div>
        <Button type="primary" icon={<ThunderboltOutlined />} loading={analyzing} onClick={runOptimizer}>
          Optimize Margins with AI
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="Average Catalog Margin" value={`${avgMargin}%`} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="Low Margin SKUs (<15%)" value={lowMarginCount} valueStyle={{ color: '#dc2626' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="Low Stock SKUs (<=5)" value={lowStockCount} valueStyle={{ color: '#d97706' }} /></Card>
        </Col>
      </Row>

      {aiAdvice && (
        <Card style={{ marginBottom: 24 }} title="AI Pricing &amp; Supplier Recommendations" bordered>
          <Alert type="success" showIcon message={aiAdvice.summary} style={{ marginBottom: 16 }} />
          {aiAdvice.recommendations?.map((rec, i) => (
            <Card key={i} size="small" style={{ marginBottom: 10 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <strong>{rec.productName}</strong>
                  <Tag color={rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'orange' : 'blue'}>
                    {(rec.priority || 'medium').toUpperCase()}
                  </Tag>
                </Space>
                <Text type="secondary">{rec.issue}</Text>
                <Text><strong>Recommendation:</strong> {rec.action}</Text>
              </Space>
            </Card>
          ))}
        </Card>
      )}

      <Card title="Product Margin Breakdown" bordered>
        <Table loading={loading} dataSource={products} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 650 }} />
      </Card>
    </div>
  );
}
