import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Dropdown, Layout, Tag } from 'antd';

import { LogoutOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';

import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { resolveFileUrl } from '@/config/serverApiConfig';
import useLanguage from '@/locale/useLanguage';

import UpgradeButton from './UpgradeButton';

export default function HeaderContent() {
  const currentAdmin = useSelector(selectCurrentAdmin);
  const { Header } = Layout;
  const translate = useLanguage();

  const ProfileDropdown = () => {
    const navigate = useNavigate();
    return (
      <div className="profileDropdown" onClick={() => navigate('/profile')}>
        <Avatar
          size="large"
          className="last"
          src={resolveFileUrl(currentAdmin?.photo)}
          style={{
            color: '#1E40AF',
            backgroundColor: currentAdmin?.photo ? 'none' : '#DBEAFE',
            fontWeight: 700,
          }}
        >
          {currentAdmin?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <div className="profileDropdownInfo">
          <p style={{ fontWeight: 600, color: '#0F172A' }}>
            {currentAdmin?.name} {currentAdmin?.surname}
          </p>
          <p style={{ fontSize: 12, color: '#64748B' }}>{currentAdmin?.email}</p>
        </div>
      </div>
    );
  };

  const items = [
    {
      label: <ProfileDropdown className="headerDropDownMenu" />,
      key: 'ProfileDropdown',
    },
    {
      type: 'divider',
    },
    {
      icon: <UserOutlined />,
      key: 'settingProfile',
      label: <Link to={'/profile'}>{translate('profile_settings')}</Link>,
    },
    {
      icon: <ToolOutlined />,
      key: 'settingApp',
      label: <Link to={'/settings'}>{translate('app_settings')}</Link>,
    },
    {
      type: 'divider',
    },
    {
      icon: <LogoutOutlined />,
      key: 'logout',
      label: <Link to={'/logout'}>{translate('logout')}</Link>,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 28px',
        height: 64,
        lineHeight: '64px',
        background: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Tag color="blue" style={{ margin: 0, fontWeight: 600, borderRadius: 6 }}>
          AccessoHub CRM
        </Tag>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <UpgradeButton />

        <Dropdown
          menu={{ items }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Avatar
            className="last"
            src={resolveFileUrl(currentAdmin?.photo)}
            style={{
              color: '#1E40AF',
              backgroundColor: currentAdmin?.photo ? 'none' : '#DBEAFE',
              boxShadow: '0 0 0 2px #EFF6FF',
              cursor: 'pointer',
              fontWeight: 700,
            }}
            size="large"
          >
            {currentAdmin?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Dropdown>
      </div>
    </Header>
  );
}
