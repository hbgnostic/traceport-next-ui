'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Set default options for crisp rendering
ChartJS.defaults.devicePixelRatio = 2; // Force high DPI rendering

type ChartData = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  data: ChartData[];
  title?: string;
  size?: 'small' | 'medium' | 'large';
  showPercentagesInLegend?: boolean;
};

export default function UnifiedPieChart({ 
  data, 
  title, 
  size = 'medium',
  showPercentagesInLegend = true 
}: Props) {
  // Consistent sizing options
  const sizeClasses = {
    small: 'w-64 h-64',   // 256px
    medium: 'w-80 h-80',  // 320px  
    large: 'w-96 h-96'    // 384px
  };

  // Default color palette
  const defaultColors = [
    '#019AA8', // Traceport teal
    '#C9E5E9', // Light teal
    '#16243E', // Dark blue
    '#A0D3D8', // Medium teal
    '#5DBABF', // Darker teal
    '#2D8A8F', // Deep teal
    '#7BB3B8', // Soft teal
    '#4A9BA0', // Blue-teal
  ];

  // Assign colors to data
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  const chartConfig = {
    labels: chartData.map(d => d.label),
    datasets: [
      {
        data: chartData.map(d => d.value),
        backgroundColor: chartData.map(d => d.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2, // Force crisp rendering
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: {
            size: 11,
          },
          generateLabels: showPercentagesInLegend ? (chart: any) => {
            const labels = chart.data.labels || [];
            return labels.map((label: string, index: number) => {
              const value = chartData[index].value;
              return {
                text: `${label}: ${value.toFixed(1)}%`,
                fillStyle: chartData[index].color,
                strokeStyle: '#ffffff',
                lineWidth: 2,
                index: index,
              };
            });
          } : undefined,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(1)}%`;
          },
        },
      },
    },
    // Force canvas to render at 2x resolution for crisp display
    onResize: (chart: any) => {
      chart.canvas.style.height = chart.canvas.style.height;
      chart.canvas.style.width = chart.canvas.style.width;
    },
  };

  return (
    <div className="mb-8">
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      )}
      <div className={`${sizeClasses[size]} mx-auto relative`}>
        <Pie data={chartConfig} options={options} />
      </div>
    </div>
  );
}