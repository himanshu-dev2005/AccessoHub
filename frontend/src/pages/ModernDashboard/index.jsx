import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Plus,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';

// Mock trend revenue dataset for recharts
const REVENUE_DATA = {
  '30d': [
    { date: 'Nov 01', revenue: 12400, leads: 24 },
    { date: 'Nov 05', revenue: 18200, leads: 32 },
    { date: 'Nov 10', revenue: 15600, leads: 28 },
    { date: 'Nov 15', revenue: 24500, leads: 45 },
    { date: 'Nov 20', revenue: 21200, leads: 38 },
    { date: 'Nov 25', revenue: 31800, leads: 52 },
    { date: 'Nov 28', revenue: 38400, leads: 64 },
  ],
  '90d': [
    { date: 'Sep', revenue: 48000, leads: 95 },
    { date: 'Oct', revenue: 65000, leads: 130 },
    { date: 'Nov', revenue: 84000, leads: 175 },
  ],
};

const PIPELINE_STAGES = [
  { name: 'Lead Qualified', count: 32, value: '$48,000', percentage: 75, color: 'bg-indigo-500' },
  { name: 'Proposal Sent', count: 18, value: '$34,500', percentage: 50, color: 'bg-sky-500' },
  { name: 'Negotiation', count: 9, value: '$22,000', percentage: 30, color: 'bg-amber-500' },
  { name: 'Closed Won', count: 14, value: '$56,200', percentage: 40, color: 'bg-emerald-500' },
];

export default function ModernDashboard() {
  const [dateRange, setDateRange] = useState('30d');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Follow up with Apex Retail regarding annual contract', time: 'Today, 2:00 PM', done: false, contact: 'Kiran Patel' },
    { id: 2, title: 'Prepare revised software proposal for Nexus Labs', time: 'Tomorrow, 11:30 AM', done: false, contact: 'Sarah Chen' },
    { id: 3, title: 'Send payment reminder for Invoice #INV-1092', time: 'Nov 30, 4:00 PM', done: true, contact: 'David Rossi' },
    { id: 4, title: 'Schedule product demo with Vertex Logistics', time: 'Dec 02, 10:00 AM', done: false, contact: 'Marcus Vance' },
  ]);

  // Connect to existing real backend endpoints
  const { result: clientStats, isLoading: clientLoading } = useFetch(() =>
    request.summary({ entity: 'client' })
  );
  const { result: invoiceStats, isLoading: invoiceLoading } = useFetch(() =>
    request.summary({ entity: 'invoice' })
  );
  const { result: paymentStats, isLoading: paymentLoading } = useFetch(() =>
    request.summary({ entity: 'payment' })
  );

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const statCards = [
    {
      title: 'Total Contacts',
      value: clientStats?.count ?? 128,
      change: '+14.2%',
      trend: 'up',
      subtitle: `${clientStats?.new ?? 12} new this month`,
      icon: Users,
    },
    {
      title: 'New Leads',
      value: clientStats?.new ?? 34,
      change: '+8.1%',
      trend: 'up',
      subtitle: 'From web and referrals',
      icon: ArrowUpRight,
    },
    {
      title: 'Deals Won',
      value: invoiceStats?.count ?? 24,
      change: '+18.4%',
      trend: 'up',
      subtitle: 'Average deal $4,200',
      icon: Briefcase,
    },
    {
      title: 'Revenue Collected',
      value: paymentStats?.total ? `$${Number(paymentStats.total).toLocaleString()}` : '$38,450',
      change: '+22.5%',
      trend: 'up',
      subtitle: 'Vs $31,400 last period',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Overview
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key metrics, revenue trajectory, and active CRM pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-white dark:bg-zinc-900 text-xs font-medium">
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === '30d'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setDateRange('90d')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === '90d'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Last 90 days
            </button>
          </div>
        </div>
      </div>

      {/* Row of 4 Compact Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          return (
            <Card key={i} hover>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.title}
                  </span>
                  <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  {clientLoading || invoiceLoading ? (
                    <Skeleton className="h-7 w-20" />
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                      {stat.value}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                      isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mid Section: Performance Chart & Pipeline Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Leads Trajectory Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Lead Trajectory</CardTitle>
            <CardDescription>Performance metrics across selected period</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={REVENUE_DATA[dateRange] || REVENUE_DATA['30d']}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 18, 21, 0.95)',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Summary (1 col) */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Active opportunities by stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {stage.name}
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {stage.value}{' '}
                    <span className="font-normal text-zinc-400">({stage.count})</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${stage.color}`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-500">
              <span>Total Pipeline</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">$160,700</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Activity Feed & Upcoming Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Real-time customer touchpoints and events</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 dark:divide-zinc-800/60 p-0">
            {[
              { name: 'Kiran Patel', action: 'signed contract for Enterprise Plan', time: '12m ago', status: 'online' },
              { name: 'Sarah Chen', action: 'viewed quote #QUO-8821 for 4th time', time: '45m ago', status: 'online' },
              { name: 'David Rossi', action: 'paid invoice #INV-1092 via Card', time: '2h ago', status: 'offline' },
              { name: 'Elena Rostova', action: 'booked product demo meeting', time: '4h ago', status: 'online' },
            ].map((activity, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={activity.name} size="sm" status={activity.status} />
                  <div className="truncate">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {activity.name}
                    </span>{' '}
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {activity.action}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks / Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Scheduled customer follow-ups and actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                  task.done
                    ? 'bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-100 dark:border-zinc-850 opacity-60'
                    : 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                }`}
              >
                <button
                  type="button"
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                    task.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-zinc-300 dark:border-zinc-700 bg-transparent'
                  }`}
                  aria-label="Toggle task"
                >
                  {task.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${task.done ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                    <span>{task.time}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">{task.contact}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
