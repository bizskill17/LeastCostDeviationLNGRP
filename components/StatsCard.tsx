
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value }) => {
  const isCount = title.toLowerCase().includes('jobs');
  
  const formatValue = (v: number | string) => {
    const num = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return v;
    
    // If it's a count of jobs, keep as integer
    if (isCount) return Math.round(num).toString();
    
    // IF VALUE IS NOT IN DECIMAL THEN NOT SHOW IN DECIMAL
    if (Number.isInteger(num)) return num.toString();
    
    return num.toFixed(3);
  };

  return (
    <div className="bg-white p-8 rounded-xl border-2 border-slate-300 shadow-sm flex flex-col items-start transition-all hover:border-black hover:shadow-md">
      <h3 className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] mb-4">{title}</h3>
      <p className="text-[40px] font-[1000] text-black leading-none tracking-tighter">
        {formatValue(value)}
      </p>
    </div>
  );
};
