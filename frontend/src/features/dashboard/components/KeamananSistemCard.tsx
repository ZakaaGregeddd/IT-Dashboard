import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { BaseBarChart } from '@/components/charts/BaseBarChart';
import { ChartOptions } from 'chart.js';

export interface KeamananDataItem {
  item: string;
  rencana: number;
  realisasi: number;
}

interface KeamananSistemCardProps {
  data: KeamananDataItem[];
  onClick?: () => void;
}

const chartOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: 0,
      max: 100,
      grid: { color: '#f1f5f9' },
      border: { dash: [4, 4] },
      ticks: {
        font: { size: 9 },
        callback: function (value) {
          return value + '%';
        }
      }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 9 } }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

export const KeamananSistemCard: React.FC<KeamananSistemCardProps> = ({ data, onClick }) => {
  const chartData = {
    labels: data.map(d => d.item),
    datasets: [
      {
        label: 'Rencana',
        data: data.map(d => d.rencana),
        backgroundColor: '#0f2e60', // Dark Blue
        barThickness: 25
      },
      {
        label: 'Realisasi',
        data: data.map(d => d.realisasi),
        backgroundColor: '#f59e0b', // Orange/Yellow
        barThickness: 25
      }
    ]
  };

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle className="flex-none">Visualisasi Tingkat Ketersediaan Sistem Keamanan TI</CardTitle>
      
      <div className="flex-1 min-h-0 w-full relative" style={{ maxHeight: '125px' }}>
        <BaseBarChart data={chartData} options={chartOptions} />
      </div>

      {/* Custom Bottom Legend */}
      <div className="flex-none flex justify-center gap-3 mt-2 text-[9px] font-medium text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#0f2e60] rounded-sm" />
          <span>Rencana</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 bg-[#f59e0b] rounded-sm" />
          <span>Realisasi</span>
        </div>
      </div>
    </Card>
  );
};
