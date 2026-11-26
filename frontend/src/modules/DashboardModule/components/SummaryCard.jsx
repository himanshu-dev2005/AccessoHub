import { Tag, Divider, Row, Col, Spin, Tooltip } from 'antd';
import { useMoney } from '@/settings';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';

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
          minHeight: '108px',
          height: '100%',
          borderRadius: 12,
        }}
      >
        <div className="pad15 strong" style={{ textAlign: 'center' }}>
          <h3
            style={{
              color: '#0F172A',
              fontSize: 15,
              margin: '4px 0',
              textTransform: 'capitalize',
            }}
          >
            {title}
          </h3>
        </div>
        <Divider style={{ padding: 0, margin: 0 }} />
        <div className="pad15">
          <Row gutter={[0, 0]} justify="space-between" align="middle" wrap={false}>
            <Col className="gutter-row" flex="95px" style={{ textAlign: 'left' }}>
              <div className="left" style={{ whiteSpace: 'nowrap', color: '#64748B' }}>
                {prefix}
              </div>
            </Col>
            <Divider style={{ height: '24px', margin: '0 8px' }} type="vertical" />
            <Col
              className="gutter-row"
              flex="auto"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isLoading ? (
                <Spin size="small" />
              ) : (
                <Tooltip title={formattedValue}>
                  <Tag
                    color={tagColor}
                    style={{
                      margin: '0 auto',
                      maxWidth: '130px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      direction: 'ltr',
                      fontWeight: 600,
                      fontSize: 13,
                      padding: '2px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {formattedValue}
                  </Tag>
                </Tooltip>
              )}
            </Col>
          </Row>
        </div>
      </div>
    </Col>
  );
}
