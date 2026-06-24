import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { BaseDoughnutChart } from '@/components/charts/BaseDoughnutChart';
import { ChartOptions } from 'chart.js';

interface SdmDistributionCardProps {
  data: {
    labels: string[];
    values: number[];
  };
  onClick?: () => void;
}

export const SdmDistributionCard: React.FC<SdmDistributionCardProps> = ({ data, onClick }) => {
  const colors = ['#0f2e60', '#1c4587', '#2b5ea8', '#3c78c9', '#5392e6', '#71aef2', '#92cbfb', '#b5e3ff'];
  
  const chartData = {
    labels: data.labels,
    datasets: [{
      data: data.values,
      backgroundColor: colors.slice(0, data.labels.length),
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    cutout: '70%'
  };

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle>Distribusi SDM IT (Outsource &amp; Pegawai)</CardTitle>
      
      <div className="flex-1 min-h-0 w-full relative flex items-center justify-center animate-fade-in" style={{ maxHeight: '150px' }}>
        <BaseDoughnutChart data={chartData} options={chartOptions} />
      </div>

      <div className="flex-none flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2 text-[9px] text-slate-600 font-medium">
        {data.labels.map((label, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
