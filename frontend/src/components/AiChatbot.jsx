import { useState, useRef, useEffect } from 'react';
import { Input, Button, Spin } from 'antd';
import { RobotOutlined, SendOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import storePersist from '@/redux/storePersist';

const WELCOME_MSG = {
  role: 'assistant',
  content:
    "👋 Hi! I'm your **AccessoHub AI Assistant**. Ask me anything about your business — invoices, customers, products, payments, or general CRM questions!",
};

function getAuthHeaders() {
  const auth = storePersist.get('auth');
  return auth ? { Authorization: `Bearer ${auth.current.token}` } : {};
}

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await axios.post(
        API_BASE_URL + 'ai/chat',
        { message: text, context: {} },
        { headers: getAuthHeaders(), withCredentials: true }
      );
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.result?.reply || 'No response generated.' },
      ]);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Session expired. Please sign in again.'
          : '⚠️ Sorry, something went wrong. Please try again.');
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <RobotOutlined style={{ fontSize: 26, color: '#fff' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        width: 390,
        height: 540,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
        border: '1px solid #1E293B',
        background: '#fff',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1120, #1E3A5F)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RobotOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>AccessoHub AI ✨</div>
            <div style={{ color: '#94A3B8', fontSize: 11 }}>Powered by Gemini</div>
          </div>
        </div>
        <CloseOutlined
          onClick={() => setOpen(false)}
          style={{ color: '#94A3B8', fontSize: 16, cursor: 'pointer' }}
        />
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          background: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '82%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #2563EB, #3B82F6)' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#1E293B',
                fontSize: 13.5,
                lineHeight: 1.55,
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '14px 14px 14px 4px',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: 5,
                alignItems: 'center',
              }}
            >
              <span className="dot-typing" style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: '#94A3B8',
                      animation: `dotPulse 1.2s ease-in-out ${d * 0.2}s infinite`,
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: 8,
          background: '#fff',
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={sendMessage}
          placeholder="Ask anything about your business..."
          style={{ borderRadius: 10, fontSize: 13.5 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={sendMessage}
          loading={loading}
          style={{
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            border: 'none',
          }}
        />
      </div>

      {/* Keyframe animation for dots */}
      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
