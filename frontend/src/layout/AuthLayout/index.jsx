import { Layout, Row, Col } from 'antd';

export default function AuthLayout({ sideContent, children }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Row style={{ minHeight: '100vh' }}>
        <Col
          xs={{ span: 0, order: 2 }}
          sm={{ span: 0, order: 2 }}
          md={{ span: 11, order: 1 }}
          lg={{ span: 12, order: 1 }}
          className="auth-hero-panel"
        >
          {sideContent}
        </Col>
        <Col
          xs={{ span: 24, order: 1 }}
          sm={{ span: 24, order: 1 }}
          md={{ span: 13, order: 2 }}
          lg={{ span: 12, order: 2 }}
          className="auth-form-panel"
        >
          {children}
        </Col>
      </Row>
    </Layout>
  );
}
