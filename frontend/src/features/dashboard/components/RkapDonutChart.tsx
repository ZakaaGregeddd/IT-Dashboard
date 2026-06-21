import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { BaseDoughnutChart } from '@/components/charts/BaseDoughnutChart';

interface RkapDonutChartProps {
  percentage: number;
  onClick?: () => void;
}

export const RkapDonutChart: React.FC<RkapDonutChartProps> = ({ percentage, onClick }) => {
  const data = {
    labels: ['Realisasi', 'Remaining'],
    datasets: [{
      data: [percentage, 100 - percentage],
      backgroundColor: ['#0f2e60', '#f1f5f9'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle>Realisasi RKAP TI</CardTitle>
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center" style={{ maxHeight: '125px' }}>
        <BaseDoughnutChart data={data} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-primary-900">{percentage}%</span>
          <span className="text-[8px] text-slate-500 font-medium">REALISASI</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[10px] text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary-900 rounded-sm"></div> <span className="text-primary-900 font-medium">Realisasi (%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-sm"></div> Cost Reduction (%)
        </div>
      </div>
    </Card>
  );
};
