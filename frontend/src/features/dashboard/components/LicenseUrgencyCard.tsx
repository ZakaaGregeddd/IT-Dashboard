import React from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, PieController, ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, PieController);

interface LicenseUrgencyCardProps {
  data: {
    under2: number;
    between2and4: number;
    over4: number;
  };
  onClick?: () => void;
}

const chartOptions: ChartOptions<'pie'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      enabled: true,
      backgroundColor: '#ffffff',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 6,
      bodyFont: {
        size: 10,
        weight: 'bold'
      },
      displayColors: false, // removes the color box to keep it clean and one line
      callbacks: {
        title: () => '', // hides title/header
        label: function (context: any) {
          return `${context.label}: ${context.raw} Lisensi`;
        }
      }
    }
  }
};

// Custom plugin to draw numbers inside the pie slices
const innerLabelsPlugin = {
  id: 'innerLabels',
  beforeTooltipDraw(chart: any) {
    const { ctx } = chart;
    ctx.save();
    chart.data.datasets.forEach((dataset: any, i: number) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((element: any, index: number) => {
        const dataVal = dataset.data[index];
        if (dataVal > 0) {
          const { x, y } = element.tooltipPosition();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(dataVal.toString(), x, y);
        }
      });
    });
    ctx.restore();
  }
};

export const LicenseUrgencyCard: React.FC<LicenseUrgencyCardProps> = ({ data, onClick }) => {
  const chartData = {
    labels: ['<= 2 Bulan', '2 - 4 Bulan', 'Lisensi Aktif (> 4 bulan)'],
    datasets: [{
      data: [data.under2, data.between2and4, data.over4],
      backgroundColor: ['#ef4444', '#f59e0b', '#0f2e60'], // Red, Yellow, Dark Blue
      borderWidth: 1,
      borderColor: '#ffffff'
    }]
  };

  return (
    <Card 
      onClick={onClick}
      className={onClick ? "cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5" : ""}
    >
      <CardTitle className="flex-none">Visualisasi Urgensi Kadarluarsa Lisensi</CardTitle>
      
      <div className="flex-1 min-h-0 w-full relative flex justify-center items-center" style={{ maxHeight: '125px' }}>
        <Pie data={chartData} options={chartOptions} plugins={[innerLabelsPlugin]} />
      </div>
      
      {/* Custom Bottom Legend */}
      <div className="flex-none flex flex-col gap-1 items-center mt-2 text-[9px] font-medium text-slate-600">
        <div className="flex gap-3 justify-center">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#ef4444] rounded-sm" />
            <span>&lt;= 2 Bulan</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-[#f59e0b] rounded-sm" />
            <span>2 - 4 Bulan</span>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-center">
          <span className="w-2.5 h-2.5 bg-[#0f2e60] rounded-sm" />
          <span>Lisensi Aktif (&gt; 4 bulan)</span>
        </div>
      </div>
    </Card>
  );
};
