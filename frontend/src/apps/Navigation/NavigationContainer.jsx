import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.svg';
import logoText from '@/style/images/logo-text.svg';
import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  MenuOutlined,
  ShopOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  CheckSquareOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  BankOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  const location = useLocation();
  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState('dashboard');

  const translate = useLanguage();
  const navigate = useNavigate();

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      type: 'group',
      label: !showLogoApp ? 'CRM & ACCOUNTS' : '',
      children: [
        {
          key: 'customer',
          icon: <CustomerServiceOutlined />,
          label: <Link to={'/customer'}>{translate('customers')}</Link>,
        },
        {
          key: 'task',
          icon: <CheckSquareOutlined />,
          label: <Link to={'/task'}>{translate('tasks')}</Link>,
        },
      ],
    },
    {
      type: 'group',
      label: !showLogoApp ? 'INVENTORY & SUPPLIERS' : '',
      children: [
        {
          key: 'productcategory',
          icon: <AppstoreOutlined />,
          label: <Link to={'/productcategory'}>{translate('product_category')}</Link>,
        },
        {
          key: 'product',
          icon: <ShoppingOutlined />,
          label: <Link to={'/product'}>{translate('products')}</Link>,
        },
        {
          key: 'supplier',
          icon: <TeamOutlined />,
          label: <Link to={'/supplier'}>{translate('suppliers')}</Link>,
        },
        {
          key: 'supplierpurchase',
          icon: <ShoppingCartOutlined />,
          label: <Link to={'/supplierpurchase'}>{translate('supplier_purchase')}</Link>,
        },
        {
          key: 'supplierpayment',
          icon: <BankOutlined />,
          label: <Link to={'/supplierpayment'}>{translate('supplier_payment')}</Link>,
        },
      ],
    },
    {
      type: 'group',
      label: !showLogoApp ? 'SALES & BILLING' : '',
      children: [
        {
          key: 'quote',
          icon: <FileSyncOutlined />,
          label: <Link to={'/quote'}>{translate('quotes')}</Link>,
        },
        {
          key: 'invoice',
          icon: <ContainerOutlined />,
          label: <Link to={'/invoice'}>{translate('invoices')}</Link>,
        },
        {
          key: 'payment',
          icon: <CreditCardOutlined />,
          label: <Link to={'/payment'}>{translate('payments')}</Link>,
        },
      ],
    },
    {
      type: 'group',
      label: !showLogoApp ? 'WORKSPACE' : '',
      children: [
        {
          key: 'payment/mode',
          label: <Link to={'/payment/mode'}>{translate('payments_mode')}</Link>,
          icon: <WalletOutlined />,
        },
        {
          key: 'taxes',
          label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
          icon: <ShopOutlined />,
        },
        {
          key: 'settings',
          label: <Link to={'/settings'}>{translate('settings')}</Link>,
          icon: <SettingOutlined />,
        },
        {
          key: 'about',
          label: <Link to={'/about'}>{translate('about')}</Link>,
          icon: <ReconciliationOutlined />,
        },
      ],
    },
  ];

  useEffect(() => {
    if (!location) return;
    if (location.pathname === '/') {
      setCurrentPath('dashboard');
    } else if (location.pathname.startsWith('/payment/mode')) {
      setCurrentPath('payment/mode');
    } else {
      const rootSegment = location.pathname.split('/')[1] || 'dashboard';
      setCurrentPath(rootSegment);
    }
  }, [location]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);

  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: isMobile ? 'absolute' : 'sticky',
        top: 0,
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '18px 20px 14px',
          margin: 0,
          width: '100%',
          height: 'auto',
        }}
      >
        <img src={logoIcon} alt="AccessoHub Logo" style={{ height: '36px', width: '36px' }} />

        {!showLogoApp && (
          <img
            src={logoText}
            alt="AccessoHub CRM"
            style={{
              height: '32px',
            }}
          />
        )}
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          borderInlineEnd: 'none',
          padding: '4px 8px 40px',
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => setVisible(true);
  const onClose = () => setVisible(false);

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 16, marginTop: 12 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer width={260} placement={'left'} closable={false} onClose={onClose} open={visible}>
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
