import './style/app.css';

import { Suspense, lazy } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import PageLoader from '@/components/PageLoader';

const AccessoHubApp = lazy(() => import('./apps/AccessoHubApp'));

export default function RootApp() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<PageLoader />}>
          <AccessoHubApp />
        </Suspense>
      </Provider>
    </BrowserRouter>
  );
}
