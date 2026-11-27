import useLanguage from '@/locale/useLanguage';

import { Col, Typography } from 'antd';

import AuthLayout from '@/layout/AuthLayout';
import SideContent from './SideContent';

import logo from '@/style/images/accessohub-logo.svg';

const { Title, Text } = Typography;

const AuthModule = ({ authContent, AUTH_TITLE }) => {
  const translate = useLanguage();
  return (
    <AuthLayout sideContent={<SideContent />}>
      <div className="auth-card">
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 0 }} span={0}>
          <img
            src={logo}
            alt="AccessoHub CRM"
            style={{
              margin: '0 auto 24px',
              display: 'block',
            }}
            height={46}
            width={200}
          />
        </Col>

        <div style={{ marginBottom: 28 }}>
          <span className="auth-eyebrow">ACCESSOHUB WORKSPACE</span>
          <Title
            level={2}
            style={{
              marginTop: 8,
              marginBottom: 6,
              color: '#0F172A',
              fontSize: 28,
              letterSpacing: '-0.02em',
            }}
          >
            {translate(AUTH_TITLE)}
          </Title>
          <Text style={{ color: '#64748B', fontSize: 14 }}>
            Enter your account credentials to continue.
          </Text>
        </div>

        <div className="site-layout-content">{authContent}</div>
      </div>
    </AuthLayout>
  );
};

export default AuthModule;
