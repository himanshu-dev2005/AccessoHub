import { useEffect, useState } from 'react';
import { Modal, Input, Button, List, Tag, Typography, Space, message } from 'antd';
import { ThunderboltOutlined, SearchOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Text, Paragraph } = Typography;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

const QUICK_ROUTES = [
  { label: 'Dashboard', path: '/' },
  { label: 'Customers', path: '/customer' },
  { label: 'Tasks', path: '/task' },
  { label: 'Invoices', path: '/invoice' },
  { label: 'Products', path: '/product' },
  { label: 'Silent Customer Churn Radar', path: '/ai/churn-radar' },
  { label: 'Smart Margin Optimizer', path: '/ai/margin-optimizer' },
  { label: 'Cash-Flow & Working Capital Bridge', path: '/ai/cashflow-bridge' },
];

export default function AiCommandBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const executeCommand = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setReply(null);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/command',
        { command: query },
        { headers: getAuthHeaders() }
      );
      const res = data.result;
      if (res?.action === 'navigate' && res.path) {
        setOpen(false);
        setQuery('');
        navigate(res.path);
        message.success(`Navigated to ${res.label || res.path}`);
      } else if (res?.action === 'create_task' && res.task) {
        const created = await request.create({ entity: 'task', jsonData: { ...res.task, status: 'pending' } });
        if (created?.success) {
          message.success(`Task created: ${res.task.title}`);
          setReply(`Created task "${res.task.title}" (${res.task.priority || 'medium'} priority).`);
        }
      } else if (res?.action === 'create_client' && res.client) {
        const created = await request.create({ entity: 'client', jsonData: res.client });
        if (created?.success) {
          message.success(`Customer added: ${res.client.name}`);
          setReply(`Added customer "${res.client.name}".`);
        }
      } else {
        setReply(res?.reply || 'Done.');
      }
    } catch {
      message.error('Command Copilot could not process that request');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = QUICK_ROUTES.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Button
        icon={<ThunderboltOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 999,
          borderRadius: 999,
          boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
        }}
      >
        AI Copilot <Tag style={{ marginLeft: 6, marginRight: 0 }}>Ctrl+K</Tag>
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#4f46e5' }} />
            <span>AccessoHub AI Command Copilot</span>
            <Tag>Ctrl+K</Tag>
          </Space>
        }
        width={600}
      >
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            autoFocus
            size="large"
            prefix={<SearchOutlined />}
            placeholder='Try "Create a follow-up task for Acme" or "Go to Churn Radar"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={executeCommand}
          />
          <Button type="primary" size="large" loading={loading} onClick={executeCommand}>
            Run
          </Button>
        </Space.Compact>

        {reply && (
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16 }}>
            <Paragraph style={{ margin: 0 }}>{reply}</Paragraph>
          </div>
        )}

        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
          Quick Jump
        </Text>
        <List
          size="small"
          dataSource={filteredRoutes.slice(0, 6)}
          renderItem={(item) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setOpen(false);
                setQuery('');
                navigate(item.path);
              }}
              extra={<ArrowRightOutlined />}
            >
              {item.label}
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
}
