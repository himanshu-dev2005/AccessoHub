import { Typography } from 'antd';
import {
  CheckCircleFilled,
  ThunderboltFilled,
  SafetyCertificateFilled,
  BarChartOutlined,
} from '@ant-design/icons';
import logoIcon from '@/style/images/logo-icon.svg';

const { Title, Text } = Typography;

export default function SideContent() {
  const highlights = [
    {
      icon: <BarChartOutlined />,
      title: 'Wholesale & Retail Pricing Engine',
      desc: 'Auto-synced tiered rates across inventory, quotations, and customer invoices.',
    },
    {
      icon: <ThunderboltFilled />,
      title: 'Supplier & Stock Control',
      desc: 'Track supplier purchases, balance dues, and live product inventory levels.',
    },
    {
      icon: <SafetyCertificateFilled />,
      title: 'Instant GST Billing & PDFs',
      desc: 'Generate clean client invoices, quotes, and payment receipts in seconds.',
    },
  ];

  return (
    <div className="sideContent">
      <div className="auth-hero-inner">
        <div className="auth-brand-badge">
          <div className="auth-brand-icon">
            <img src={logoIcon} alt="AccessoHub" style={{ width: 26, height: 26 }} />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              AccessoHub CRM
            </div>
            <div style={{ color: '#93C5FD', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
              REVENUE &amp; INVENTORY SUITE
            </div>
          </div>
        </div>

        <Title
          level={1}
          style={{
            color: '#FFFFFF',
            fontSize: 36,
            lineHeight: 1.18,
            marginBottom: 16,
            letterSpacing: '-0.03em',
          }}
        >
          Built for Fast, Bold Revenue Operations.
        </Title>

        <Text
          style={{
            color: '#CBD5E1',
            fontSize: 15,
            display: 'block',
            marginBottom: 36,
            lineHeight: 1.65,
          }}
        >
          Manage wholesale &amp; retail pricing, customer accounts, supplier purchases, and real-time
          cash flow from one unified command center.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {highlights.map((item) => (
            <div key={item.title} className="auth-feature-item">
              <div className="auth-feature-icon">{item.icon}</div>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                  {item.title}
                </div>
                <div style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="auth-hero-footer">
          <CheckCircleFilled style={{ color: '#34D399' }} />
          <span>Secured Workspace • Cloud Firestore Sync</span>
        </div>
      </div>
    </div>
  );
}
