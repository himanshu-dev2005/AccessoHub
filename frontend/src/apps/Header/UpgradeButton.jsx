import { Button, Dropdown } from 'antd';
import {
  PlusOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  FileSyncOutlined,
  ContainerOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export default function UpgradeButton() {
  const navigate = useNavigate();

  const quickCreateItems = [
    {
      key: 'productcategory',
      icon: <AppstoreOutlined />,
      label: 'New Product Category',
      onClick: () => navigate('/productcategory'),
    },
    {
      key: 'product',
      icon: <ShoppingOutlined />,
      label: 'New Product',
      onClick: () => navigate('/product'),
    },
    {
      key: 'supplier',
      icon: <TeamOutlined />,
      label: 'New Supplier',
      onClick: () => navigate('/supplier'),
    },
    {
      key: 'supplierpurchase',
      icon: <ShoppingCartOutlined />,
      label: 'New Supplier Purchase',
      onClick: () => navigate('/supplierpurchase'),
    },
    {
      key: 'supplierpayment',
      icon: <BankOutlined />,
      label: 'New Supplier Payment',
      onClick: () => navigate('/supplierpayment'),
    },
    {
      type: 'divider',
    },
    {
      key: 'customer',
      icon: <TeamOutlined />,
      label: 'New Customer',
      onClick: () => navigate('/customer'),
    },
    {
      key: 'task',
      icon: <CheckSquareOutlined />,
      label: 'New Task',
      onClick: () => navigate('/task'),
    },
    {
      key: 'quote',
      icon: <FileSyncOutlined />,
      label: 'New Quote',
      onClick: () => navigate('/quote/create'),
    },
    {
      key: 'invoice',
      icon: <ContainerOutlined />,
      label: 'New Invoice',
      onClick: () => navigate('/invoice/create'),
    },
  ];

  return (
    <Dropdown menu={{ items: quickCreateItems }} trigger={['click']} placement="bottomRight">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{
          marginTop: '2px',
          fontWeight: 600,
          borderRadius: 8,
        }}
      >
        Quick Create
      </Button>
    </Dropdown>
  );
}
