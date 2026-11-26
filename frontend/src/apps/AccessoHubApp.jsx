import { lazy, Suspense } from 'react';

import { useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';

const CrmApp = lazy(() => import('./CrmApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <CrmApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

export default function AccessoHubApp() {
  const { isLoggedIn } = useSelector(selectAuth);

  if (!isLoggedIn) {
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  }

  return <DefaultApp />;
}
