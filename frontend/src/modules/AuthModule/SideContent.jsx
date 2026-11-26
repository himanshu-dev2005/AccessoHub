import { Layout, Typography } from 'antd';
import logo from '@/style/images/accessohub-logo.svg';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function SideContent() {
  return (
    <Content
      style={{
        padding: '110px 36px 36px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}
      className="sideContent"
    >
      <div style={{ width: '100%' }}>
        <img
          src={logo}
          alt="AccessoHub CRM"
          style={{ margin: '0 0 36px', display: 'block' }}
          height={56}
          width={240}
        />

        <Title level={2} style={{ fontSize: 28, lineHeight: 1.3, marginBottom: 12 }}>
          Powering Modern Customer Relationships
        </Title>
        <Text style={{ fontSize: 15, display: 'block', marginBottom: 32, lineHeight: 1.6 }}>
          AccessoHub unifies lead capture, deal pipelines, client accounts, quoting, and revenue
          operations in one collaborative workspace.
        </Text>

        <ul className="list-checked">
          <li className="list-checked-item list-checked-item-left">
            <strong style={{ display: 'block', marginBottom: 4 }}>
              Lead &amp; Deal Pipeline Management
            </strong>
            <span>Track prospects from first touch through qualification to closed-won deals.</span>
          </li>
          <li className="list-checked-item list-checked-item-left">
            <strong style={{ display: 'block', marginBottom: 4 }}>
              360° Customer &amp; Task Tracking
            </strong>
            <span>Keep every account interaction, follow-up task, and contact organized.</span>
          </li>
          <li className="list-checked-item list-checked-item-left">
            <strong style={{ display: 'block', marginBottom: 4 }}>
              Quotes, Invoices &amp; Revenue Analytics
            </strong>
            <span>Convert approved quotes into invoices and monitor cash flow in real time.</span>
          </li>
        </ul>

        <div className="space20"></div>
      </div>
    </Content>
  );
}
