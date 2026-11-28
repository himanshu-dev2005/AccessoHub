import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Statistic,
  Alert,
  Space,
  List,
  message,
} from 'antd';
import {
  SwapOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Title, Text } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

export default function AiCashflowBridge() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [unpaidPurchases, setUnpaidPurchases] = useState([]);
  const [aiPlan, setAiPlan] = useState(null);
  const [taskedIds, setTaskedIds] = useState([]);

  useEffect(() => {
    loadBridgeData();
  }, []);

  const loadBridgeData = async () => {
    setLoading(true);
    try {
      const [invRes, purRes] = await Promise.all([
        request.listAll({ entity: 'invoice' }),
        request.listAll({ entity: 'supplierpurchase' }),
      ]);
      const invoices = invRes?.result || [];
      const purchases = purRes?.result || [];

      const now = Date.now();
      const openInvoices = invoices
        .map((inv) => {
          const total = Number(inv.total || 0);
          const paid = Number(inv.credit || 0);
          const amountDue = Math.max(0, total - paid);
          const due = inv.expiredDate ? new Date(inv.expiredDate).getTime() : now;
          const daysOverdue = Math.max(0, Math.floor((now - due) / (1000 * 60 * 60 * 24)));
          return {
            key: inv._id,
            _id: inv._id,
            invoiceNumber: `#${inv.number || ''}`,
            client: inv.client?.name || 'Customer',
            amountDue,
            daysOverdue,
            paymentStatus: inv.paymentStatus || 'unpaid',
          };
        })
        .filter((i) => i.amountDue > 0 && i.paymentStatus !== 'paid')
        .sort((a, b) => b.amountDue - a.amountDue);

      const openPurchases = purchases
        .map((pur) => {
          const total = Number(pur.total || 0);
          const paid = Number(pur.paidAmount || 0);
          const amountDue = Math.max(0, total - paid);
          return {
            key: pur._id,
            _id: pur._id,
            number: pur.number || '-',
            supplier: pur.supplier?.name || 'Supplier',
            amountDue,
            status: pur.status || 'ordered',
            paymentStatus: pur.paymentStatus || 'unpaid',
          };
        })
        .filter((p) => p.amountDue > 0 && p.paymentStatus !== 'paid' && p.status !== 'cancelled')
        .sort((a, b) => b.amountDue - a.amountDue);

      setUnpaidInvoices(openInvoices);
      setUnpaidPurchases(openPurchases);
    } catch {
      message.error('Failed to load receivables and payables');
    } finally {
      setLoading(false);
    }
  };

  const totalReceivable = unpaidInvoices.reduce((s, i) => s + i.amountDue, 0);
  const totalPayable = unpaidPurchases.reduce((s, p) => s + p.amountDue, 0);
  const netGap = totalReceivable - totalPayable;

  const runAiBridge = async () => {
    setAnalyzing(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/cashflow-bridge',
        { totalReceivable, totalPayable, netGap, unpaidInvoices, unpaidPurchases },
        { headers: getAuthHeaders() }
      );
      setAiPlan(data.result);
      message.success('Working capital bridge analyzed!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to analyze cash-flow bridge');
    } finally {
      setAnalyzing(false);
    }
  };

  const createCollectionTask = async (record) => {
    try {
      const res = await request.create({
        entity: 'task',
        jsonData: {
          title: `Collect ${record.invoiceNumber} from ${record.client} (₹${record.amountDue.toLocaleString('en-IN')})`,
          type: 'call',
          priority: record.daysOverdue > 0 ? 'urgent' : 'high',
          status: 'pending',
          description: `Working capital collection priority: ${record.daysOverdue} days overdue.`,
        },
      });
      if (res?.success) {
        setTaskedIds((prev) => [...prev, record._id]);
        message.success(`Collection task created for ${record.client}!`);
      }
    } catch {
      message.error('Failed to create collection task');
    }
  };

  const invoiceColumns = [
    { title: 'Invoice', dataIndex: 'invoiceNumber', key: 'invoiceNumber', width: 90 },
    { title: 'Customer', dataIndex: 'client', key: 'client' },
    {
      title: 'Overdue',
      dataIndex: 'daysOverdue',
      key: 'daysOverdue',
      width: 100,
      render: (d) => (d > 0 ? <Tag color="red">{d}d overdue</Tag> : <Tag color="blue">Current</Tag>),
    },
    {
      title: 'Due',
      dataIndex: 'amountDue',
      key: 'amountDue',
      align: 'right',
      render: (v) => `₹${v.toLocaleString('en-IN')}`,
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, r) => {
        const done = taskedIds.includes(r._id);
        return (
          <Button
            size="small"
            type={done ? 'default' : 'primary'}
            disabled={done}
            icon={done ? <CheckCircleOutlined /> : <PlusOutlined />}
            onClick={() => createCollectionTask(r)}
          >
            {done ? 'Added' : 'Collect'}
          </Button>
        );
      },
    },
  ];

  const purchaseColumns = [
    { title: 'PO #', dataIndex: 'number', key: 'number', width: 90 },
    { title: 'Supplier', dataIndex: 'supplier', key: 'supplier' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={s === 'received' ? 'green' : 'gold'}>{s}</Tag>,
    },
    {
      title: 'Payable',
      dataIndex: 'amountDue',
      key: 'amountDue',
      align: 'right',
      render: (v) => `₹${v.toLocaleString('en-IN')}`,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1250, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <SwapOutlined style={{ color: '#2563eb' }} />
            Cash-Flow &amp; Working Capital Bridge
          </Title>
          <Text type="secondary">
            Bridges customer receivables (money in) against supplier payables (money out) to prevent cash-flow crunches.
          </Text>
        </div>
        <Button type="primary" icon={<ThunderboltOutlined />} loading={analyzing} onClick={runAiBridge}>
          Analyze Bridge with AI
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Statistic
              title="Customer Receivables (In)"
              value={totalReceivable}
              prefix="₹"
              valueStyle={{ color: '#059669' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Statistic
              title="Supplier Payables (Out)"
              value={totalPayable}
              prefix="₹"
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered>
            <Statistic
              title="Net Working Capital Gap"
              value={netGap}
              prefix="₹"
              valueStyle={{ color: netGap >= 0 ? '#2563eb' : '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>

      {aiPlan && (
        <Card
          style={{ marginBottom: 24 }}
          title={
            <Space>
              <span>AI Collection &amp; Payout Plan</span>
              {aiPlan.urgencyLevel && (
                <Tag color={aiPlan.urgencyLevel === 'high' ? 'red' : aiPlan.urgencyLevel === 'medium' ? 'orange' : 'green'}>
                  Urgency: {String(aiPlan.urgencyLevel).toUpperCase()}
                </Tag>
              )}
            </Space>
          }
          bordered
        >
          <Alert type={netGap >= 0 ? 'info' : 'warning'} showIcon message={aiPlan.summary} style={{ marginBottom: 16 }} />
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={5}>Collect These Invoices First</Title>
              <List
                size="small"
                dataSource={aiPlan.collectionPriority || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.invoiceNumber || ''} — ${item.client} (₹${Number(item.amountDue || 0).toLocaleString('en-IN')})`}
                      description={item.reason}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>Supplier Payout Strategy</Title>
              <List
                size="small"
                dataSource={aiPlan.paymentStrategy || []}
                renderItem={(step) => <List.Item>{step}</List.Item>}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={`Open Customer Receivables (${unpaidInvoices.length})`} bordered>
            <Table loading={loading} dataSource={unpaidInvoices} columns={invoiceColumns} pagination={{ pageSize: 6 }} size="small" scroll={{ x: 500 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={`Open Supplier Payables (${unpaidPurchases.length})`} bordered>
            <Table loading={loading} dataSource={unpaidPurchases} columns={purchaseColumns} pagination={{ pageSize: 6 }} size="small" scroll={{ x: 450 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
