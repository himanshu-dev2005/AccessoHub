import { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Segmented, Statistic, Tag, Progress, Tooltip, Empty, Spin } from 'antd';
import { LineChartOutlined, ShopOutlined, ShoppingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { request } from '@/request';
import { useMoney } from '@/settings';

function formatCompact(num) {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return `${Math.round(num)}`;
}

function buildSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  return points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
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
        if (active) setInvoices([]);
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
  const svgHeight = 240;
  const padLeft = 50;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 34;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;
  const stepX = months.length > 1 ? plotW / (months.length - 1) : plotW;

  const wholesalePoints = months.map((m, idx) => ({
    x: months.length > 1 ? padLeft + stepX * idx : padLeft + plotW / 2,
    y: padTop + plotH - (m.wholesale / maxMonthly) * plotH,
    data: m,
  }));

  const retailPoints = months.map((m, idx) => ({
    x: months.length > 1 ? padLeft + stepX * idx : padLeft + plotW / 2,
    y: padTop + plotH - (m.retail / maxMonthly) * plotH,
    data: m,
  }));

  const wholesaleLine = buildSmoothPath(wholesalePoints);
  const retailLine = buildSmoothPath(retailPoints);
  const baselineY = padTop + plotH;
  const wholesaleArea =
    wholesalePoints.length > 1
      ? `${wholesaleLine} L ${wholesalePoints[wholesalePoints.length - 1].x.toFixed(1)} ${baselineY} L ${wholesalePoints[0].x.toFixed(1)} ${baselineY} Z`
      : '';
  const retailArea =
    retailPoints.length > 1
      ? `${retailLine} L ${retailPoints[retailPoints.length - 1].x.toFixed(1)} ${baselineY} L ${retailPoints[0].x.toFixed(1)} ${baselineY} Z`
      : '';

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
            <LineChartOutlined style={{ color: '#2563EB' }} />
            Sales Trend: Wholesale vs. Retail
          </h3>
          <span style={{ fontSize: 12, color: '#64748B' }}>
            Monthly invoiced revenue line graph split by customer category
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
              <span style={{ color: '#2563EB', fontWeight: 600 }}>● Wholesale</span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>● Retail</span>
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
            aria-label="Wholesale vs Retail Sales Line Graph"
          >
            <defs>
              <linearGradient id="wholesaleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="retailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>

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

            {wholesaleArea && <path d={wholesaleArea} fill="url(#wholesaleGrad)" />}
            {retailArea && <path d={retailArea} fill="url(#retailGrad)" />}

            <path
              d={wholesaleLine}
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={retailLine}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {months.map((m, idx) => {
              const wp = wholesalePoints[idx];
              const rp = retailPoints[idx];
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
                    <circle cx={wp.x} cy={wp.y} r="4.5" fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
                    <circle cx={rp.x} cy={rp.y} r="4.5" fill="#10B981" stroke="#fff" strokeWidth="1.5" />
                    <rect x={wp.x - 16} y={padTop} width={32} height={plotH} fill="transparent" />
                    <text
                      x={wp.x}
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
