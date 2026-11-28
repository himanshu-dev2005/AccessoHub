import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Segmented, Statistic, Tag, Progress, Tooltip, Empty, Spin } from 'antd';
import { BarChartOutlined, ShopOutlined, ShoppingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@/request';
import { useMoney } from '@/settings';

function formatCompact(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return `${Math.round(num)}`;
}

export default function WholesaleRetailSalesChart() {
  const { moneyFormatter } = useMoney();
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('6M');
  const [invoices, setInvoices] = useState([]);
  const [clientMap, setClientMap] = useState({});

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [invRes, cliRes] = await Promise.all([
          request.listAll({ entity: 'invoice' }),
          request.listAll({ entity: 'client' }),
        ]);
        if (!active) return;
        const map = {};
        (cliRes?.result || []).forEach((c) => {
          if (c?._id) map[c._id] = c.category || 'retail';
        });
        setClientMap(map);
        setInvoices(invRes?.result || []);
      } catch {
        if (active) {
          setInvoices([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const { months, totalWholesale, totalRetail, maxMonthly } = useMemo(() => {
    const count = range === '12M' ? 12 : 6;
    const buckets = [];
    const lookup = {};

    for (let i = count - 1; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month');
      const key = d.format('YYYY-MM');
      const bucket = {
        key,
        label: d.format('MMM'),
        fullLabel: d.format('MMM YYYY'),
        wholesale: 0,
        retail: 0,
      };
      buckets.push(bucket);
      lookup[key] = bucket;
    }

    let wTotal = 0;
    let rTotal = 0;

    invoices.forEach((inv) => {
      const amount = Number(inv.total || 0);
      if (amount <= 0) return;

      const clientId = typeof inv.client === 'object' ? inv.client?._id : inv.client;
      const category =
        (typeof inv.client === 'object' && inv.client?.category) ||
        clientMap[clientId] ||
        'retail';

      const invKey = dayjs(inv.date || inv.created).format('YYYY-MM');
      if (lookup[invKey]) {
        if (category === 'wholesale') {
          lookup[invKey].wholesale += amount;
          wTotal += amount;
        } else {
          lookup[invKey].retail += amount;
          rTotal += amount;
        }
      }
    });

    const maxVal = Math.max(
      1,
      ...buckets.map((b) => Math.max(b.wholesale, b.retail))
    );

    return {
      months: buckets,
      totalWholesale: wTotal,
      totalRetail: rTotal,
      maxMonthly: maxVal,
    };
  }, [invoices, clientMap, range]);

  const combined = totalWholesale + totalRetail;
  const wholesalePct = combined > 0 ? Math.round((totalWholesale / combined) * 100) : 0;
  const retailPct = combined > 0 ? 100 - wholesalePct : 0;

  const svgWidth = 680;
  const svgHeight = 230;
  const padLeft = 48;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 32;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;
  const groupW = plotW / Math.max(1, months.length);
  const barW = Math.min(24, Math.max(10, groupW * 0.28));

  return (
    <Card
      className="whiteBox shadow"
      style={{ borderRadius: 12 }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#2563EB' }} />
            Sales Overview: Wholesale vs. Retail
          </h3>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            Monthly invoiced revenue split by customer category
          </span>
        </div>

        <Segmented
          size="small"
          value={range}
          onChange={setRange}
          options={[
            { label: 'Last 6 Months', value: '6M' },
            { label: 'Last 12 Months', value: '12M' },
          ]}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 18 }}>
        <Col xs={24} sm={12} md={8}>
          <div style={{ padding: '12px 14px', background: '#EFF6FF', borderRadius: 10, border: '1px solid #DBEAFE' }}>
            <Statistic
              title={
                <span style={{ color: '#1E40AF', fontWeight: 500, fontSize: 12 }}>
                  <ShopOutlined /> Wholesale Sales ({wholesalePct}%)
                </span>
              }
              value={moneyFormatter({ amount: totalWholesale })}
              valueStyle={{ color: '#1D4ED8', fontSize: 20, fontWeight: 700 }}
            />
          </div>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <div style={{ padding: '12px 14px', background: '#ECFDF5', borderRadius: 10, border: '1px solid #D1FAE5' }}>
            <Statistic
              title={
                <span style={{ color: '#065F46', fontWeight: 500, fontSize: 12 }}>
                  <ShoppingOutlined /> Retail Sales ({retailPct}%)
                </span>
              }
              value={moneyFormatter({ amount: totalRetail })}
              valueStyle={{ color: '#059669', fontSize: 20, fontWeight: 700 }}
            />
          </div>
        </Col>
        <Col xs={24} md={8}>
          <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: '#475569', fontWeight: 500 }}>Wholesale vs Retail Share</span>
              <Tag color="blue" style={{ margin: 0 }}>{wholesalePct}% / {retailPct}%</Tag>
            </div>
            <Progress
              percent={100}
              success={{ percent: wholesalePct, strokeColor: '#2563EB' }}
              strokeColor="#10B981"
              showInfo={false}
              size="small"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748B', marginTop: 6 }}>
              <span>● Wholesale</span>
              <span>● Retail</span>
            </div>
          </div>
        </Col>
      </Row>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin />
        </div>
      ) : combined === 0 && invoices.length === 0 ? (
        <Empty description="No invoice sales data yet to plot" />
      ) : (
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ width: '100%', minWidth: 420, height: 'auto', display: 'block' }}
            role="img"
            aria-label="Wholesale vs Retail Sales Chart"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padTop + plotH - t * plotH;
              return (
                <g key={t}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={svgWidth - padRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={t === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94A3B8"
                  >
                    {formatCompact(maxMonthly * t)}
                  </text>
                </g>
              );
            })}

            {months.map((m, idx) => {
              const centerX = padLeft + groupW * idx + groupW / 2;
              const wH = (m.wholesale / maxMonthly) * plotH;
              const rH = (m.retail / maxMonthly) * plotH;
              const wY = padTop + plotH - wH;
              const rY = padTop + plotH - rH;

              return (
                <Tooltip
                  key={m.key}
                  title={
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.fullLabel}</div>
                      <div>Wholesale: {moneyFormatter({ amount: m.wholesale })}</div>
                      <div>Retail: {moneyFormatter({ amount: m.retail })}</div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 4, paddingTop: 4 }}>
                        Total: {moneyFormatter({ amount: m.wholesale + m.retail })}
                      </div>
                    </div>
                  }
                >
                  <g style={{ cursor: 'pointer' }}>
                    <rect
                      x={centerX - barW - 2}
                      y={wY}
                      width={barW}
                      height={Math.max(2, wH)}
                      rx={4}
                      fill="#2563EB"
                    />
                    <rect
                      x={centerX + 2}
                      y={rY}
                      width={barW}
                      height={Math.max(2, rH)}
                      rx={4}
                      fill="#10B981"
                    />
                    <text
                      x={centerX}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#64748B"
                    >
                      {m.label}
                    </text>
                  </g>
                </Tooltip>
              );
            })}
          </svg>
        </div>
      )}
    </Card>
  );
}
