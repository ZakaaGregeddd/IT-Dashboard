import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { BaseBarChart } from '@/components/charts/BaseBarChart';
import { ChartData, ChartOptions } from 'chart.js';

export interface LegendItem {
  text: string;
  color: string;
}

interface KpiChartCardProps {
  title: string;
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
  customLegendItems?: LegendItem[];
  onClick?: () => void;
}

export const KpiChartCard: React.FC<KpiChartCardProps> = ({ title, data, options, customLegendItems, onClick }) => {
  const legendItems = customLegendItems || data.datasets.map(d => ({
    text: d.label || '',
    color: Array.isArray(d.backgroundColor) ? d.backgroundColor[0] : (d.backgroundColor as string) || '#000'
  }));

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle className="flex-none">{title}</CardTitle>
      <div className="flex-1 min-h-0 w-full relative" style={{ maxHeight: '125px' }}>
        <BaseBarChart data={data} options={options} />
      </div>
      <div className="flex-none flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1 text-[9px] text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
