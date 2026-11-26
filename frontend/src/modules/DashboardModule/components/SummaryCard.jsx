import { Tag, Row, Col, Spin, Tooltip } from 'antd';
import { useMoney } from '@/settings';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';

const ACCENT_MAP = {
  blue: '#2563EB',
  purple: '#7C3AED',
  cyan: '#0891B2',
  green: '#059669',
};

export default function AnalyticSummaryCard({
  title,
  tagColor = 'blue',
  data,
  prefix,
  isLoading = false,
}) {
  const { moneyFormatter } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);
  const formattedValue = moneyFormatter({
    amount: data || 0,
    currency_code: money_format_settings?.default_currency_code,
  });
  const accent = ACCENT_MAP[tagColor] || '#1D4ED8';

  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 12 }}
      md={{ span: 12 }}
      lg={{ span: 6 }}
    >
      <div
        className="whiteBox shadow"
        style={{
          color: '#475569',
          fontSize: 13,
          minHeight: '116px',
          height: '100%',
          borderRadius: 14,
          borderTop: `3px solid ${accent}`,
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <h3
            style={{
              color: '#0F172A',
              fontSize: 14,
              margin: 0,
              textTransform: 'capitalize',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>
          <Tag
            color={tagColor}
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 11,
              borderRadius: 6,
            }}
          >
            {prefix}
          </Tag>
        </div>

        <Row align="middle" style={{ marginTop: 14 }}>
          <Col span={24}>
            {isLoading ? (
              <Spin size="small" />
            ) : (
              <Tooltip title={formattedValue}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {formattedValue}
                </div>
              </Tooltip>
            )}
          </Col>
        </Row>
      </div>
    </Col>
  );
}
