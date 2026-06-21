import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const defaultBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#f1f5f9' }, 
      border: { dash: [4, 4] },
      ticks: { font: { size: 9 } }
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

interface BaseBarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

export const BaseBarChart: React.FC<BaseBarChartProps> = ({ data, options }) => {
  return (
    <div className="chart-container">
      <Bar data={data} options={options || defaultBarOptions} />
    </div>
  );
};
