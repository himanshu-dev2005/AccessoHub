import { useMemo } from 'react';
import { Col, Progress, Spin } from 'antd';
import useLanguage from '@/locale/useLanguage';

const colours = {
  draft: '#64748B',
  sent: '#2563EB',
  pending: '#0EA5E9',
  unpaid: '#F59E0B',
  overdue: '#EF4444',
  partially: '#06B6D4',
  paid: '#10B981',
  declined: '#EF4444',
  accepted: '#10B981',
  expired: '#78716C',
  ordered: '#2563EB',
  received: '#10B981',
  cancelled: '#EF4444',
};

const defaultStatisticsMap = {
  invoice: [
    { tag: 'draft', value: 0 },
    { tag: 'pending', value: 0 },
    { tag: 'overdue', value: 0 },
    { tag: 'paid', value: 0 },
    { tag: 'unpaid', value: 0 },
    { tag: 'partially', value: 0 },
  ],
  quote: [
    { tag: 'draft', value: 0 },
    { tag: 'pending', value: 0 },
    { tag: 'sent', value: 0 },
    { tag: 'accepted', value: 0 },
    { tag: 'declined', value: 0 },
    { tag: 'expired', value: 0 },
  ],
  supplierpurchase: [
    { tag: 'draft', value: 0 },
    { tag: 'ordered', value: 0 },
    { tag: 'received', value: 0 },
    { tag: 'cancelled', value: 0 },
  ],
};

const PreviewState = ({ tag, value }) => {
  const translate = useLanguage();
  const stroke = colours[tag] || '#2563EB';
  return (
    <div style={{ color: '#475569', marginBottom: 10 }}>
      <div className="left alignLeft capitalize" style={{ fontWeight: 500 }}>
        {translate(tag)}
      </div>
      <div className="right alignRight" style={{ fontWeight: 600 }}>
        {value ?? 0} %
      </div>
      <Progress
        percent={value ?? 0}
        showInfo={false}
        strokeColor={stroke}
        trailColor="#E2E8F0"
        size="small"
      />
    </div>
  );
};

export default function PreviewCard({
  title = 'Preview',
  statistics = [],
  isLoading = false,
  entity = 'invoice',
}) {
  const statisticsMap = useMemo(() => {
    const defaults = defaultStatisticsMap[entity] || defaultStatisticsMap.quote;
    return defaults.map((defaultStat) => {
      const matchedStat = Array.isArray(statistics)
        ? statistics.find((stat) => stat.tag === defaultStat.tag)
        : null;
      return matchedStat || defaultStat;
    });
  }, [statistics, entity]);

  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 24 }}
      md={{ span: 12 }}
      lg={{ span: 12 }}
    >
      <div className="pad20">
        <h3
          style={{
            color: '#0F172A',
            fontSize: 16,
            marginBottom: 24,
            marginTop: 0,
          }}
        >
          {title}
        </h3>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : (
          statisticsMap.map((status, index) => (
            <PreviewState key={index} tag={status.tag} value={status?.value} />
          ))
        )}
      </div>
    </Col>
  );
}
