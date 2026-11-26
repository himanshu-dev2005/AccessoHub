import { useEffect } from 'react';
import { Row, Col, Card, Statistic, Tag, Button } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import useLanguage from '@/locale/useLanguage';
import { useMoney } from '@/settings';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import useOnFetch from '@/hooks/useOnFetch';
import { selectMoneyFormat } from '@/redux/settings/selectors';

import RecentTable from './components/RecentTable';
import SummaryCard from './components/SummaryCard';
import PreviewCard from './components/PreviewCard';
import CustomerPreviewCard from './components/CustomerPreviewCard';

export default function DashboardModule() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);

  const getStatsData = async ({ entity, currency }) => {
    return await request.summary({
      entity,
      options: { currency },
    });
  };

  const {
    result: invoiceResult,
    isLoading: invoiceLoading,
    onFetch: fetchInvoicesStats,
  } = useOnFetch();

  const { result: quoteResult, isLoading: quoteLoading, onFetch: fetchQuotesStats } = useOnFetch();

  const {
    result: paymentResult,
    isLoading: paymentLoading,
    onFetch: fetchPaymentsStats,
  } = useOnFetch();

  const { result: productResult, isLoading: productLoading } = useFetch(() =>
    request.summary({ entity: 'product' })
  );
  const { result: purchaseResult, isLoading: purchaseLoading } = useFetch(() =>
    request.summary({ entity: 'supplierpurchase' })
  );
  const { result: supplierPaymentResult, isLoading: supplierPaymentLoading } = useFetch(() =>
    request.summary({ entity: 'supplierpayment' })
  );
  const { result: taskResult, isLoading: taskLoading } = useFetch(() =>
    request.summary({ entity: 'task' })
  );
  const { result: clientResult, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );

  useEffect(() => {
    const currency = money_format_settings?.default_currency_code || 'INR';

    fetchInvoicesStats(getStatsData({ entity: 'invoice', currency }));
    fetchQuotesStats(getStatsData({ entity: 'quote', currency }));
    fetchPaymentsStats(getStatsData({ entity: 'payment', currency }));
  }, [
    money_format_settings?.default_currency_code,
    fetchInvoicesStats,
    fetchQuotesStats,
    fetchPaymentsStats,
  ]);

  const dataTableColumns = [
    {
      title: translate('number'),
      dataIndex: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      onCell: () => ({
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      }),
      render: (total, record) => moneyFormatter({ amount: total, currency_code: record.currency }),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      render: (status) => <Tag color="blue">{translate(status)}</Tag>,
    },
  ];

  const revenueCards = [
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('Invoices'),
    },
    {
      result: quoteResult,
      isLoading: quoteLoading,
      entity: 'quote',
      title: translate('quote'),
    },
  ];

  const procurementCards = [
    {
      result: purchaseResult,
      isLoading: purchaseLoading,
      entity: 'supplierpurchase',
      title: translate('supplier_purchase'),
    },
    {
      result: invoiceResult,
      isLoading: invoiceLoading,
      entity: 'invoice',
      title: translate('invoices_preview'),
    },
  ];

  if (!money_format_settings) {
    return <></>;
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: '#0F172A', fontSize: 22 }}>
            AccessoHub Executive Overview
          </h2>
          <span style={{ color: '#64748B', fontSize: 13 }}>
            Inventory, supplier procurement, customer accounts, tasks, and revenue operations
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<PlusOutlined />} onClick={() => navigate('/product')}>
            Add Product
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/supplierpurchase')}>
            New Purchase
          </Button>
        </div>
      </div>

      <Row gutter={[20, 20]}>
        <SummaryCard
          title={translate('inventory_value')}
          tagColor="blue"
          prefix={`${productResult?.count ?? 0} ${translate('products')}`}
          isLoading={productLoading}
          data={productResult?.total}
        />
        <SummaryCard
          title={translate('supplier_purchase')}
          tagColor="purple"
          prefix={`${purchaseResult?.count ?? 0} POs`}
          isLoading={purchaseLoading}
          data={purchaseResult?.total}
        />
        <SummaryCard
          title={translate('supplier_payment')}
          tagColor="cyan"
          prefix={`${supplierPaymentResult?.count ?? 0} Paid`}
          isLoading={supplierPaymentLoading}
          data={supplierPaymentResult?.total}
        />
        <SummaryCard
          title={translate('collected_revenue')}
          tagColor="green"
          prefix={translate('This month')}
          isLoading={paymentLoading}
          data={paymentResult?.total}
        />
      </Row>

      <div className="space20"></div>

      <Row gutter={[20, 20]}>
        <Col xs={{ span: 24 }} lg={{ span: 18 }}>
          <div className="whiteBox shadow" style={{ borderRadius: 12 }}>
            <Row className="pad10" gutter={[0, 0]}>
              {revenueCards.map((data, index) => (
                <PreviewCard
                  key={index}
                  title={data.title}
                  isLoading={data.isLoading}
                  entity={data.entity}
                  statistics={
                    !data.isLoading &&
                    data.result?.performance?.map((item) => ({
                      tag: item?.status,
                      value: item?.percentage,
                    }))
                  }
                />
              ))}
            </Row>
          </div>
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 6 }}>
          <CustomerPreviewCard
            isLoading={clientLoading}
            activeCustomer={clientResult?.active}
            newCustomer={clientResult?.new}
          />
        </Col>
      </Row>

      <div className="space20"></div>

      <Card
        className="whiteBox shadow"
        loading={taskLoading}
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: '18px 24px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={12} sm={6}>
            <Statistic
              title="Pending Tasks"
              value={taskResult?.pending ?? 0}
              prefix={<ClockCircleOutlined style={{ color: '#F59E0B' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="In Progress"
              value={taskResult?.in_progress ?? 0}
              prefix={<SyncOutlined style={{ color: '#2563EB' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Completed"
              value={taskResult?.completed ?? 0}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic
              title="Low Stock Products"
              value={productResult?.lowStock ?? 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#EF4444' }} />}
            />
          </Col>
        </Row>
      </Card>

      <div className="space20"></div>

      <Row gutter={[20, 20]}>
        <Col xs={{ span: 24 }}>
          <div className="whiteBox shadow" style={{ borderRadius: 12 }}>
            <Row className="pad10" gutter={[0, 0]}>
              {procurementCards.map((data, index) => (
                <PreviewCard
                  key={index}
                  title={data.title}
                  isLoading={data.isLoading}
                  entity={data.entity}
                  statistics={
                    !data.isLoading &&
                    data.result?.performance?.map((item) => ({
                      tag: item?.status,
                      value: item?.percentage,
                    }))
                  }
                />
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      <div className="space20"></div>

      <Row gutter={[20, 20]}>
        <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
          <div className="whiteBox shadow pad20" style={{ height: '100%', borderRadius: 12 }}>
            <h3 style={{ color: '#0F172A', marginBottom: 12, padding: '0 8px' }}>
              {translate('Recent Invoices')}
            </h3>
            <RecentTable entity={'invoice'} dataTableColumns={dataTableColumns} />
          </div>
        </Col>

        <Col className="gutter-row w-full" sm={{ span: 24 }} lg={{ span: 12 }}>
          <div className="whiteBox shadow pad20" style={{ height: '100%', borderRadius: 12 }}>
            <h3 style={{ color: '#0F172A', marginBottom: 12, padding: '0 8px' }}>
              {translate('Recent Quotes')}
            </h3>
            <RecentTable entity={'quote'} dataTableColumns={dataTableColumns} />
          </div>
        </Col>
      </Row>
    </>
  );
}
