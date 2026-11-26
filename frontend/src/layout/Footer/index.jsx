import { Layout } from 'antd';

const { Footer } = Layout;

const FooterContent = () => (
  <Footer
    style={{
      textAlign: 'center',
      background: 'transparent',
      color: '#64748B',
      fontSize: 13,
      padding: '16px 24px',
    }}
  >
    AccessoHub CRM &copy; {new Date().getFullYear()} &mdash; Customer Relationship &amp; Revenue
    Platform
  </Footer>
);

export default FooterContent;
