import { useState } from 'react';
import {
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  Tag,
  List,
  Space,
  Divider,
  message,
} from 'antd';
import {
  AudioOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';
import { request } from '@/request';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

const SENTIMENT_COLOR = {
  hot: 'red',
  warm: 'orange',
  cold: 'blue',
};

const PRIORITY_COLOR = {
  urgent: 'red',
  high: 'volcano',
  medium: 'gold',
  low: 'default',
};

export default function AiMeetingNotes() {
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [createdIndexes, setCreatedIndexes] = useState([]);
  const [creatingAll, setCreatingAll] = useState(false);

  const handleAnalyze = async () => {
    if (!notes.trim()) {
      message.warning('Please paste meeting notes or a call transcript first');
      return;
    }
    setLoading(true);
    setCreatedIndexes([]);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/meeting-notes',
        { notes, customerName },
        { headers: getAuthHeaders() }
      );
      setAnalysis(data.result);
      message.success('Meeting notes summarized!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to analyze notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (item, index) => {
    try {
      const res = await request.create({
        entity: 'task',
        jsonData: {
          title: item.title,
          type: item.type || 'follow_up',
          priority: item.priority || 'medium',
          status: 'pending',
          description: customerName
            ? `[${customerName}] ${item.description || ''}`
            : item.description || '',
        },
      });
      if (res?.success) {
        setCreatedIndexes((prev) => [...prev, index]);
        message.success(`Task "${item.title}" added to CRM!`);
      }
    } catch {
      message.error('Failed to create task');
    }
  };

  const handleCreateAllTasks = async () => {
    if (!analysis?.actionItems?.length) return;
    setCreatingAll(true);
    try {
      for (let i = 0; i < analysis.actionItems.length; i++) {
        if (!createdIndexes.includes(i)) {
          await handleCreateTask(analysis.actionItems[i], i);
        }
      }
    } finally {
      setCreatingAll(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AudioOutlined style={{ color: '#4f46e5' }} />
          AI Meeting &amp; Call Notes Summarizer
        </Title>
        <Text type="secondary">
          Paste raw call transcripts or meeting notes to extract a concise summary, deal temperature, and one-click CRM follow-up tasks.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={10}>
          <Card title="1. Raw Notes / Transcript" bordered>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Client / Account (optional)
                </Text>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Meeting Notes or Call Transcript
                </Text>
                <TextArea
                  rows={10}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste notes here... e.g. Spoke with Sarah about annual enterprise license. They want a 15% volume discount and need security docs by Friday. Schedule a technical demo next Tuesday."
                />
              </div>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={loading}
                onClick={handleAnalyze}
                block
              >
                Summarize &amp; Extract Tasks
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <span>2. AI Takeaways &amp; Action Items</span>
                {analysis?.sentiment && (
                  <Tag color={SENTIMENT_COLOR[analysis.sentiment] || 'default'}>
                    Deal Temp: {String(analysis.sentiment).toUpperCase()}
                  </Tag>
                )}
              </Space>
            }
            extra={
              analysis?.actionItems?.length > 0 && (
                <Button
                  size="small"
                  type="primary"
                  icon={<PlusOutlined />}
                  loading={creatingAll}
                  onClick={handleCreateAllTasks}
                >
                  Create All Tasks
                </Button>
              )
            }
            bordered
          >
            {!analysis ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: '#8c8c8c' }}>
                Paste meeting notes on the left and click &ldquo;Summarize &amp; Extract Tasks&rdquo;.
              </div>
            ) : (
              <div>
                <Title level={5}>Executive Summary</Title>
                <Paragraph>{analysis.summary}</Paragraph>

                {analysis.keyDecisions?.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>Key Decisions</Title>
                    <List
                      size="small"
                      dataSource={analysis.keyDecisions}
                      renderItem={(dec) => (
                        <List.Item>
                          <Space>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <span>{dec}</span>
                          </Space>
                        </List.Item>
                      )}
                    />
                  </>
                )}

                <Divider />
                <Title level={5}>Extracted Action Items</Title>
                <List
                  dataSource={analysis.actionItems || []}
                  renderItem={(item, idx) => {
                    const isCreated = createdIndexes.includes(idx);
                    return (
                      <List.Item
                        actions={[
                          <Button
                            key="add"
                            size="small"
                            type={isCreated ? 'default' : 'primary'}
                            disabled={isCreated}
                            icon={isCreated ? <CheckCircleOutlined /> : <PlusOutlined />}
                            onClick={() => handleCreateTask(item, idx)}
                          >
                            {isCreated ? 'Added' : 'Add Task'}
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <span>{item.title}</span>
                              <Tag color={PRIORITY_COLOR[item.priority] || 'default'}>
                                {item.priority || 'medium'}
                              </Tag>
                              <Tag>{item.type || 'follow_up'}</Tag>
                            </Space>
                          }
                          description={item.description}
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
