import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import PageLoader from '@/components/PageLoader';
import AiChatbot from '@/components/AiChatbot';
import ModernLayout from '@/layout/ModernLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { settingsAction } from '@/redux/settings/actions';
import AppRouter from '@/router/AppRouter';

export default function CrmApp() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(settingsAction.list({ entity: 'setting' }));
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <ModernLayout>
        <Suspense fallback={<PageLoader />}>
          <AppRouter />
        </Suspense>
        <AiChatbot />
      </ModernLayout>
    </ErrorBoundary>
  );
}
