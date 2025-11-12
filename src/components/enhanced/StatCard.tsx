import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-lg border border-white/20 shadow-lg text-shadow-strong">
    <div className="flex justify-between items-start">
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
      <div className={`${color}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-slate-100">{value}</p>
      {subtitle && <p className="text-xs text-green-800 dark:text-green-400 font-semibold">{subtitle}</p>}
    </div>
  </div>
);