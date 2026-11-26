import { Button, Card, Descriptions, Result, Tag } from 'antd';
import { RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <Card className="whiteBox shadow" style={{ borderRadius: 12 }}>
      <Result
        icon={<RocketOutlined style={{ color: '#2563EB' }} />}
        title="AccessoHub CRM"
        subTitle="Enterprise Customer Relationship Management, Inventory, Supplier Procurement & Revenue Operations Platform"
        extra={[
          <Button type="primary" key="dashboard" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>,
          <Button key="products" onClick={() => navigate('/product')}>
            Manage Products
          </Button>,
        ]}
      >
        <Descriptions bordered column={1} size="middle" style={{ maxWidth: 640, margin: '0 auto' }}>
          <Descriptions.Item label="Platform">AccessoHub CRM</Descriptions.Item>
          <Descriptions.Item label="Version">
            <Tag color="blue">v1.0.0</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Core Modules">
            Customers, Tasks, Product Categories, Products, Suppliers, Supplier Purchases, Supplier
            Payments, Quotes, Invoices, Payments
          </Descriptions.Item>
          <Descriptions.Item label="Support Email">support@accessohub.com</Descriptions.Item>
        </Descriptions>
      </Result>
    </Card>
  );
};

export default About;
