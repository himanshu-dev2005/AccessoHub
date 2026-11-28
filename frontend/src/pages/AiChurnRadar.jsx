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
  Space,
  Alert,
  Modal,
  message,
} from 'antd';
import {
  RadarChartOutlined,
  ThunderboltOutlined,
  MailOutlined,
  PlusOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Title, Text, Paragraph } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

const RISK_COLOR = {
  high: 'red',
  medium: 'orange',
  low: 'green',
};

export default function AiChurnRadar() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [customerMetrics, setCustomerMetrics] = useState([]);
  const [aiReport, setAiReport] = useState(null);
  const [taskedClients, setTaskedClients] = useState([]);
  const [emailModal, setEmailModal] = useState({ open: false, loading: false, content: null, client: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsRes, invoicesRes] = await Promise.all([
        request.listAll({ entity: 'client' }),
        request.listAll({ entity: 'invoice' }),
      ]);
      const clients = clientsRes?.result || [];
      const invoices = invoicesRes?.result || [];

      const now = Date.now();
      const computed = clients.map((c) => {
        const clientInvoices = invoices.filter(
          (inv) => inv.client?._id === c._id || inv.client === c._id
        );
        const lastDates = clientInvoices
          .map((inv) => new Date(inv.date || inv.created).getTime())
          .filter((t) => !Number.isNaN(t));
        const lastActivity = lastDates.length > 0
          ? Math.max(...lastDates)
          : new Date(c.updated || c.created || now).getTime();
        const daysSilent = Math.max(0, Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24)));
        const totalSpend = clientInvoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);

        let riskLevel = 'low';
        if (daysSilent >= 60 || (clientInvoices.length === 0 && daysSilent >= 30)) riskLevel = 'high';
        else if (daysSilent >= 30) riskLevel = 'medium';

        return {
          key: c._id,
          _id: c._id,
          name: c.name,
          company: c.company || '-',
          email: c.email || '',
          invoiceCount: clientInvoices.length,
          totalSpend,
          daysSilent,
          riskLevel,
        };
      });

      computed.sort((a, b) => b.daysSilent - a.daysSilent);
      setCustomerMetrics(computed);
    } catch {
      message.error('Failed to load customer activity data');
    } finally {
      setLoading(false);
    }
  };

  const runAiRadar = async () => {
    setAnalyzing(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/churn-radar',
        { customers: customerMetrics },
        { headers: getAuthHeaders() }
      );
      setAiReport(data.result);
      message.success('AI Churn Radar analysis complete!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to run Churn Radar');
    } finally {
      setAnalyzing(false);
    }
  };

  const createFollowUpTask = async (record) => {
    try {
      const res = await request.create({
        entity: 'task',
        jsonData: {
          title: `Win-back check-in: ${record.name}`,
          type: 'follow_up',
          priority: record.riskLevel === 'high' ? 'high' : 'medium',
          status: 'pending',
          description: record.winBackOffer || `Account silent for ${record.daysSilent} days. Reach out with a check-in.`,
        },
      });
      if (res?.success) {
        setTaskedClients((prev) => [...prev, record.name]);
        message.success(`Follow-up task created for ${record.name}!`);
      }
    } catch {
      message.error('Could not create task');
    }
  };

  const draftWinBackEmail = async (record) => {
    setEmailModal({ open: true, loading: true, content: null, client: record.name });
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/email',
        {
          customerName: record.name,
          customerEmail: record.email,
          context: `Win-back email for an account silent for ${record.daysSilent} days. Offer: ${record.winBackOffer || 'Friendly check-in and loyalty update'}`,
          tone: 'friendly',
        },
        { headers: getAuthHeaders() }
      );
      setEmailModal({ open: true, loading: false, content: data.result, client: record.name });
    } catch {
      setEmailModal({ open: false, loading: false, content: null, client: '' });
      message.error('Failed to draft win-back email');
    }
  };

  const highRiskCount = customerMetrics.filter((c) => c.riskLevel === 'high').length;
  const silent30Count = customerMetrics.filter((c) => c.daysSilent >= 30).length;

  const columns = [
    { title: 'Customer', dataIndex: 'name', key: 'name', render: (v, r) => (<div><strong>{v}</strong><div style={{ fontSize: 12, color: '#64748b' }}>{r.company}</div></div>) },
    { title: 'Invoices', dataIndex: 'invoiceCount', key: 'invoiceCount', align: 'center', width: 90 },
    { title: 'Total Spend', dataIndex: 'totalSpend', key: 'totalSpend', align: 'right', render: (v) => `₹${Number(v || 0).toLocaleString('en-IN')}` },
    { title: 'Days Silent', dataIndex: 'daysSilent', key: 'daysSilent', align: 'center', render: (d) => <Tag color={d >= 60 ? 'red' : d >= 30 ? 'orange' : 'blue'}>{d} days</Tag> },
    { title: 'Churn Risk', dataIndex: 'riskLevel', key: 'riskLevel', render: (r) => <Tag color={RISK_COLOR[r]}>{r.toUpperCase()}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const done = taskedClients.includes(record.name);
        return (
          <Space>
            <Button size="small" icon={<MailOutlined />} onClick={() => draftWinBackEmail(record)}>
              Win-Back Email
            </Button>
            <Button
              size="small"
              type={done ? 'default' : 'primary'}
              disabled={done}
              icon={done ? <CheckCircleOutlined /> : <PlusOutlined />}
              onClick={() => createFollowUpTask(record)}
            >
              {done ? 'Task Added' : 'Follow-Up'}
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <RadarChartOutlined style={{ color: '#e11d48' }} />
            Silent Customer &amp; Churn Radar
          </Title>
          <Text type="secondary">
            Automatically detects dormant accounts based on invoice inactivity and generates AI win-back campaigns.
          </Text>
        </div>
        <Button type="primary" icon={<ThunderboltOutlined />} loading={analyzing} onClick={runAiRadar}>
          Run AI Retention Scan
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="Total Customers Scanned" value={customerMetrics.length} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="Silent 30+ Days" value={silent30Count} valueStyle={{ color: '#d97706' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered><Statistic title="High Churn Risk" value={highRiskCount} valueStyle={{ color: '#dc2626' }} /></Card>
        </Col>
      </Row>

      {aiReport && (
        <Card style={{ marginBottom: 24, borderColor: '#fecdd3' }} title="AI Retention Strategy" bordered>
          <Alert type="info" showIcon message={aiReport.summary} style={{ marginBottom: 16 }} />
          {aiReport.atRiskCustomers?.map((item, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 10 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <strong>{item.name}</strong>
                  <Tag color={RISK_COLOR[item.riskLevel] || 'orange'}>{(item.riskLevel || 'medium').toUpperCase()}</Tag>
                  <Text type="secondary">{item.daysSilent} days silent</Text>
                </Space>
                <Text>{item.reason}</Text>
                <Text type="success"><strong>Win-Back Offer:</strong> {item.winBackOffer}</Text>
              </Space>
            </Card>
          ))}
        </Card>
      )}

      <Card title="Customer Activity &amp; Inactivity Radar" bordered>
        <Table loading={loading} dataSource={customerMetrics} columns={columns} pagination={{ pageSize: 10 }} scroll={{ x: 700 }} />
      </Card>

      <Modal
        open={emailModal.open}
        title={`AI Win-Back Email — ${emailModal.client}`}
        onCancel={() => setEmailModal({ open: false, loading: false, content: null, client: '' })}
        footer={[
          <Button
            key="copy"
            type="primary"
            disabled={!emailModal.content}
            onClick={() => {
              const c = emailModal.content;
              navigator.clipboard.writeText(`Subject: ${c.subject}\n\n${c.greeting}\n\n${c.body}\n\n${c.closing}`);
              message.success('Win-back email copied!');
            }}
          >
            Copy Email
          </Button>,
        ]}
      >
        {emailModal.loading ? (
          <Paragraph>Generating personalized win-back email...</Paragraph>
        ) : emailModal.content ? (
          <div>
            <Paragraph><strong>Subject:</strong> {emailModal.content.subject}</Paragraph>
            <Paragraph>{emailModal.content.greeting}</Paragraph>
            <Paragraph style={{ whiteSpace: 'pre-line' }}>{emailModal.content.body}</Paragraph>
            <Paragraph style={{ whiteSpace: 'pre-line' }}>{emailModal.content.closing}</Paragraph>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
