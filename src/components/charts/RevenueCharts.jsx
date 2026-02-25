import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const S = { muted: '#D9ECFF', bg: '#020D1F', border: '#0A2142' };

const CustomTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#06162A', border: '1px solid #1a5ca8', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: S.muted, fontSize: '12px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 700 }}>
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PipelineGrowthChart() {
  const data = [
    { month: 'Jan', pipeline: 320, qualified: 140 },
    { month: 'Feb', pipeline: 410, qualified: 180 },
    { month: 'Mar', pipeline: 390, qualified: 165 },
    { month: 'Apr', pipeline: 520, qualified: 230 },
    { month: 'May', pipeline: 610, qualified: 275 },
    { month: 'Jun', pipeline: 680, qualified: 310 },
    { month: 'Jul', pipeline: 720, qualified: 345 },
    { month: 'Aug', pipeline: 890, qualified: 420 },
  ];

  return (
    <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px' }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Pipeline Growth After Ark Data</p>
      <p style={{ color: S.muted, fontSize: '12px', marginBottom: '20px' }}>Total vs. qualified pipeline ($K) over 8 months</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a5ca8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1a5ca8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="qualifiedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A2142" />
          <XAxis dataKey="month" tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip content={<CustomTooltip prefix="$" suffix="K" />} />
          <Legend wrapperStyle={{ color: S.muted, fontSize: 12 }} />
          <Area type="monotone" dataKey="pipeline" name="Total Pipeline" stroke="#1a5ca8" fill="url(#pipelineGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="qualified" name="Qualified Pipeline" stroke="#22c55e" fill="url(#qualifiedGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReplyRateChart() {
  const data = [
    { week: 'W1', before: 8, after: 12 },
    { week: 'W2', before: 7, after: 15 },
    { week: 'W3', before: 9, after: 18 },
    { week: 'W4', before: 8, after: 22 },
    { week: 'W5', before: 10, after: 26 },
    { week: 'W6', before: 9, after: 29 },
    { week: 'W7', before: 8, after: 31 },
    { week: 'W8', before: 10, after: 35 },
  ];

  return (
    <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px' }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Outbound Reply Rate Lift</p>
      <p style={{ color: S.muted, fontSize: '12px', marginBottom: '20px' }}>Before vs. after intent-based prioritization (%)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A2142" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip suffix="%" />} />
          <Legend wrapperStyle={{ color: S.muted, fontSize: 12 }} />
          <Bar dataKey="before" name="Before Ark Data" fill="#1a3a6a" radius={[3, 3, 0, 0]} />
          <Bar dataKey="after" name="After Ark Data" fill="#B1001A" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ROIOverTimeChart() {
  const data = [
    { month: 'Month 1', roi: 0.8 },
    { month: 'Month 2', roi: 1.6 },
    { month: 'Month 3', roi: 2.8 },
    { month: 'Month 4', roi: 3.9 },
    { month: 'Month 5', roi: 5.1 },
    { month: 'Month 6', roi: 6.2 },
  ];

  return (
    <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px' }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Average Customer ROI</p>
      <p style={{ color: S.muted, fontSize: '12px', marginBottom: '20px' }}>Return on investment over first 6 months</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#B1001A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#B1001A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A2142" />
          <XAxis dataKey="month" tick={{ fill: S.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}×`} />
          <Tooltip content={<CustomTooltip suffix="× ROI" />} />
          <Line type="monotone" dataKey="roi" name="ROI" stroke="#B1001A" strokeWidth={2.5} dot={{ fill: '#B1001A', strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadFunnelChart() {
  const data = [
    { stage: 'Anonymous', count: 10000 },
    { stage: 'Identified', count: 3800 },
    { stage: 'Enriched', count: 2900 },
    { stage: 'High Intent', count: 1400 },
    { stage: 'Converted', count: 420 },
  ];

  return (
    <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px' }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Lead Funnel with Ark Data</p>
      <p style={{ color: S.muted, fontSize: '12px', marginBottom: '20px' }}>Typical monthly visitor journey (per 10k sessions)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A2142" horizontal={false} />
          <XAxis type="number" tick={{ fill: S.muted, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString()} />
          <YAxis type="category" dataKey="stage" tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={75} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Visitors" radius={[0, 4, 4, 0]}
            fill="#1a5ca8"
            background={{ fill: '#0A2142', radius: [0, 4, 4, 0] }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CACReductionChart() {
  const data = [
    { quarter: 'Q1 (Before)', cac: 480 },
    { quarter: 'Q2', cac: 410 },
    { quarter: 'Q3', cac: 340 },
    { quarter: 'Q4 (With Ark)', cac: 295 },
  ];

  return (
    <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px' }}>
      <p style={{ color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>Customer Acquisition Cost Reduction</p>
      <p style={{ color: S.muted, fontSize: '12px', marginBottom: '20px' }}>Average CAC across customer base ($)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A2142" vertical={false} />
          <XAxis dataKey="quarter" tick={{ fill: S.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: S.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip content={<CustomTooltip prefix="$" />} />
          <Bar dataKey="cac" name="CAC" radius={[4, 4, 0, 0]}
            fill="#063524"
            label={false}
          >
            {data.map((_, i) => (
              <rect key={i} fill={i === data.length - 1 ? '#22c55e' : '#1a5ca8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}