
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  onClick?: () => void;
}

const colorClasses: Record<StatCardProps['color'], { bg: string; text: string; change: string }> = {
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', change: 'text-blue-700 dark:text-blue-300' },
  green: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', change: 'text-green-700 dark:text-green-300' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', change: 'text-amber-700 dark:text-amber-300' },
  red: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', change: 'text-red-700 dark:text-red-300' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', change: 'text-purple-700 dark:text-purple-300' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400', change: 'text-cyan-700 dark:text-cyan-300' },
};

const ChangeIndicator: React.FC<{ change: number, color: string }> = ({ change, color }) => {
  const isPositive = change >= 0;
  return (
    <div className={`text-xs font-semibold flex items-center ${color}`}>
      {isPositive ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
      )}
      <span>{Math.abs(change)}%</span>
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, onClick }) => {
  const classes = colorClasses[color];
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className={`bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-lg border border-white/20 shadow-lg text-shadow-strong w-full text-left transition-all duration-200 ${onClick ? 'hover:border-white/40 cursor-pointer hover:shadow-xl hover:scale-105' : ''}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</p>
        <div className={`p-2 rounded-full ${classes.bg} ${classes.text}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 mt-2 dark:text-slate-100">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-2 mt-1">
             <ChangeIndicator change={change} color={classes.change} />
             <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
          </div>
        )}
      </div>
    </Component>
  );
};
