
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ComputedDeviationRecord } from '../types';

interface LossChartProps {
  records: ComputedDeviationRecord[];
}

export const LossChart: React.FC<LossChartProps> = ({ records }) => {
  const data = React.useMemo(() => {
    if (!records || records.length === 0) return [];
    
    const companyLosses: Record<string, number> = {};
    records.forEach(r => {
      const name = r.companyName || 'Unknown';
      companyLosses[name] = (companyLosses[name] || 0) + (r.amount || 0);
    });
    
    return Object.entries(companyLosses)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);
  }, [records]);

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-300 h-[400px] flex items-center justify-center text-black uppercase tracking-widest font-black">
        No deviation data available for chart
      </div>
    );
  }

  const COLORS = [
    '#000000', '#222222', '#444444', '#666666', '#888888',
    '#111111', '#333333', '#555555', '#777777', '#999999'
  ];

  const formatYAxis = (name: string) => {
    if (name.length > 20) {
      return name.substring(0, 18) + '...';
    }
    return name;
  };

  const dynamicHeight = Math.max(400, data.length * 35 + 100);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-300 font-sans" style={{ height: `${dynamicHeight}px` }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-black uppercase tracking-tight">Top 30 Revenue Impact by Company (₹)</h3>
        <span className="text-[10px] font-black text-black bg-slate-200 px-2 py-1 rounded uppercase tracking-widest">
          {data.length} Companies Shown
        </span>
      </div>
      <div className="w-full h-[calc(100%-60px)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 10, right: 40, top: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={160} 
              fontSize={10} 
              tick={{ fill: '#000000', fontWeight: 900 }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }}
              contentStyle={{ borderRadius: '4px', border: '1px solid #000', fontSize: '12px', color: '#000', fontWeight: 'bold' }}
              formatter={(value: number) => [`₹${Math.round(value)}`, 'Impact']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
