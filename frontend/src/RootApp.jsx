import './style/tailwind.css';
import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';
import ErrorBoundary from '@/components/ErrorBoundary';

const AccessoHubApp = lazy(() => import('./apps/AccessoHubApp'));

export default function RootApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AccessoHubApp />
          </Suspense>
        </ErrorBoundary>
      </Provider>
    </BrowserRouter>
  );
}
