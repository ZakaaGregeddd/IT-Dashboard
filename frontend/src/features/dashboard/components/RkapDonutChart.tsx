import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { BaseDoughnutChart } from '@/components/charts/BaseDoughnutChart';

interface RkapDonutChartProps {
  title: string;
  percentage: number;
  labels?: string[];
  colors?: string[];
  legendItems?: { label: string; color: string }[];
  onClick?: () => void;
}

export const RkapDonutChart: React.FC<RkapDonutChartProps> = ({ 
  title, 
  percentage, 
  labels = ['Realisasi', 'Remaining'],
  colors = ['#0f2e60', '#f59e0b'],
  legendItems = [
    { label: 'Realisasi (%)', color: '#0f2e60' },
    { label: 'Cost Reduction (%)', color: '#f59e0b' }
  ],
  onClick 
}) => {
  const data = {
    labels,
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: colors,
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle>{title}</CardTitle>
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        <BaseDoughnutChart data={data} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-primary-900">{percentage}%</span>
          <span className="text-[7px] text-slate-500 font-medium">REALISASI</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-[9px] text-slate-600">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
            <span style={{ color: item.color }} className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
