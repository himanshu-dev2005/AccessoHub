import { ConfigProvider } from 'antd';

export default function Localization({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1D4ED8',
          colorLink: '#1D4ED8',
          colorText: '#0F172A',
          colorTextSecondary: '#475569',
          colorBorder: '#E2E8F0',
          colorBgLayout: '#F1F5F9',
          borderRadius: 10,
          controlHeight: 38,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Menu: {
            darkItemBg: '#0B1120',
            darkSubMenuItemBg: '#0B1120',
            darkItemColor: '#94A3B8',
            darkItemHoverColor: '#FFFFFF',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
            darkItemSelectedBg: '#1D4ED8',
            darkItemSelectedColor: '#FFFFFF',
            darkGroupTitleColor: '#64748B',
            itemBorderRadius: 8,
            itemMarginInline: 6,
          },
          Button: {
            borderRadius: 8,
            fontWeight: 600,
            primaryShadow: '0 4px 12px rgba(29, 78, 216, 0.22)',
          },
          Table: {
            headerBg: '#F8FAFC',
            headerColor: '#334155',
            rowHoverBg: '#F8FAFC',
            borderColor: '#E2E8F0',
          },
          Card: {
            borderRadiusLG: 14,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
