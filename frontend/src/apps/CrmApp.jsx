import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Layout } from 'antd';

import Navigation from '@/apps/Navigation/NavigationContainer';
import HeaderContent from '@/apps/Header/HeaderContainer';
import PageLoader from '@/components/PageLoader';
import FooterContent from '@/layout/Footer';

import { settingsAction } from '@/redux/settings/actions';

import AppRouter from '@/router/AppRouter';
import useResponsive from '@/hooks/useResponsive';

export default function CrmApp() {
  const { Content } = Layout;
  const { isMobile } = useResponsive();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, [dispatch]);

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      <Navigation />

      <Layout style={{ marginLeft: 0, background: '#F8FAFC' }}>
        <HeaderContent />
        <Content
          style={{
            margin: isMobile ? '20px auto 24px' : '28px auto 32px',
            overflow: 'initial',
            width: '100%',
            padding: isMobile ? '0 16px' : '0 36px',
            maxWidth: isMobile ? 'none' : 1440,
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <AppRouter />
          </Suspense>
        </Content>
        <FooterContent />
      </Layout>
    </Layout>
  );
}
