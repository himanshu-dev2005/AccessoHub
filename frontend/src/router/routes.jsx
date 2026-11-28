/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Customer = lazy(() => import('@/pages/Customer'));
const Task = lazy(() => import('@/pages/Task'));

const ProductCategory = lazy(() => import('@/pages/ProductCategory'));
const Product = lazy(() => import('@/pages/Product'));
const Supplier = lazy(() => import('@/pages/Supplier'));
const SupplierPurchase = lazy(() => import('@/pages/SupplierPurchase'));
const SupplierPayment = lazy(() => import('@/pages/SupplierPayment'));

const Invoice = lazy(() => import('@/pages/Invoice'));
const InvoiceCreate = lazy(() => import('@/pages/Invoice/InvoiceCreate'));
const InvoiceRead = lazy(() => import('@/pages/Invoice/InvoiceRead'));
const InvoiceUpdate = lazy(() => import('@/pages/Invoice/InvoiceUpdate'));
const InvoiceRecordPayment = lazy(() => import('@/pages/Invoice/InvoiceRecordPayment'));

const Quote = lazy(() => import('@/pages/Quote'));
const QuoteCreate = lazy(() => import('@/pages/Quote/QuoteCreate'));
const QuoteRead = lazy(() => import('@/pages/Quote/QuoteRead'));
const QuoteUpdate = lazy(() => import('@/pages/Quote/QuoteUpdate'));

const Payment = lazy(() => import('@/pages/Payment/index'));
const PaymentRead = lazy(() => import('@/pages/Payment/PaymentRead'));
const PaymentUpdate = lazy(() => import('@/pages/Payment/PaymentUpdate'));

const PaymentMode = lazy(() => import('@/pages/PaymentMode'));
const Taxes = lazy(() => import('@/pages/Taxes'));

const Settings = lazy(() => import('@/pages/Settings/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const About = lazy(() => import('@/pages/About'));
const Logout = lazy(() => import('@/pages/Logout.jsx'));
const NotFound = lazy(() => import('@/pages/NotFound.jsx'));

const AiEmailDrafter = lazy(() => import('@/pages/AiEmailDrafter'));
const AiSmartInvoice = lazy(() => import('@/pages/AiSmartInvoice'));
const AiFinancialInsights = lazy(() => import('@/pages/AiFinancialInsights'));
const AiPaymentPrediction = lazy(() => import('@/pages/AiPaymentPrediction'));
const AiDocumentScanner = lazy(() => import('@/pages/AiDocumentScanner'));
const AiMeetingNotes = lazy(() => import('@/pages/AiMeetingNotes'));
const AiChurnRadar = lazy(() => import('@/pages/AiChurnRadar'));
const AiMarginOptimizer = lazy(() => import('@/pages/AiMarginOptimizer'));

let routes = {
  expense: [],
  default: [
    {
      path: '/login',
      element: <Navigate to="/" />,
    },
    {
      path: '/logout',
      element: <Logout />,
    },
    {
      path: '/about',
      element: <About />,
    },
    {
      path: '/',
      element: <Dashboard />,
    },
    {
      path: '/customer',
      element: <Customer />,
    },
    {
      path: '/task',
      element: <Task />,
    },
    {
      path: '/productcategory',
      element: <ProductCategory />,
    },
    {
      path: '/product',
      element: <Product />,
    },
    {
      path: '/supplier',
      element: <Supplier />,
    },
    {
      path: '/supplierpurchase',
      element: <SupplierPurchase />,
    },
    {
      path: '/supplierpayment',
      element: <SupplierPayment />,
    },
    {
      path: '/invoice',
      element: <Invoice />,
    },
    {
      path: '/invoice/create',
      element: <InvoiceCreate />,
    },
    {
      path: '/invoice/read/:id',
      element: <InvoiceRead />,
    },
    {
      path: '/invoice/update/:id',
      element: <InvoiceUpdate />,
    },
    {
      path: '/invoice/pay/:id',
      element: <InvoiceRecordPayment />,
    },
    {
      path: '/quote',
      element: <Quote />,
    },
    {
      path: '/quote/create',
      element: <QuoteCreate />,
    },
    {
      path: '/quote/read/:id',
      element: <QuoteRead />,
    },
    {
      path: '/quote/update/:id',
      element: <QuoteUpdate />,
    },
    {
      path: '/payment',
      element: <Payment />,
    },
    {
      path: '/payment/read/:id',
      element: <PaymentRead />,
    },
    {
      path: '/payment/update/:id',
      element: <PaymentUpdate />,
    },
    {
      path: '/payment/mode',
      element: <PaymentMode />,
    },
    {
      path: '/taxes',
      element: <Taxes />,
    },
    {
      path: '/settings',
      element: <Settings />,
    },
    {
      path: '/settings/edit/:settingsKey',
      element: <Settings />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/ai/email',
      element: <AiEmailDrafter />,
    },
    {
      path: '/ai/invoice',
      element: <AiSmartInvoice />,
    },
    {
      path: '/ai/insights',
      element: <AiFinancialInsights />,
    },
    {
      path: '/ai/predictions',
      element: <AiPaymentPrediction />,
    },
    {
      path: '/ai/scanner',
      element: <AiDocumentScanner />,
    },
    {
      path: '/ai/notes',
      element: <AiMeetingNotes />,
    },
    {
      path: '/ai/churn-radar',
      element: <AiChurnRadar />,
    },
    {
      path: '/ai/margin-optimizer',
      element: <AiMarginOptimizer />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
};

export default routes;
