import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const defaultDoughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false }, 
    tooltip: { enabled: false } 
  },
  rotation: -90,
  circumference: 360,
  cutout: '80%'
};

interface BaseDoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
}

export const BaseDoughnutChart: React.FC<BaseDoughnutChartProps> = ({ data, options }) => {
  return (
    <div className="chart-container-donut">
      <Doughnut data={data} options={options || defaultDoughnutOptions} />
    </div>
  );
};
