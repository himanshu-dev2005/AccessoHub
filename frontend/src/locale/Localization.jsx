import { ConfigProvider } from 'antd';

export default function Localization({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2563EB',
          colorLink: '#1D4ED8',
          colorBgLayout: '#F8FAFC',
          borderRadius: 8,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Menu: {
            itemSelectedBg: '#EFF6FF',
            itemSelectedColor: '#1D4ED8',
            itemBorderRadius: 8,
          },
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
