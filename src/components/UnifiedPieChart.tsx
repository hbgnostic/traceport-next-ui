'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.defaults.devicePixelRatio = 2;

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
  showPercentagesInLegend = true,
}: Props) {
  const sizeClasses = {
    small: 'w-64 h-64',
    medium: 'w-80 h-80',
    large: 'w-96 h-96',
  };

  const programColors = ['#019AA8', '#5DBABF', '#7BB3B8', '#A0D3D8', '#C9E5E9'];
  const adminColor = '#7A89A7';
  const fundraisingColor = '#E18C7D';

  // Assign colors based on content
  let programIndex = 0;
  const chartData = data.map((item) => {
    const label = item.label.toLowerCase();
    let color;

    if (label.includes('admin')) {
      color = adminColor;
    } else if (label.includes('fundraising')) {
      color = fundraisingColor;
    } else {
      color = programColors[programIndex % programColors.length];
      programIndex += 1;
    }

    return {
      ...item,
      color: item.color || color,
    };
  });

  const chartConfig = {
    labels: chartData.map((d) => d.label),
    datasets: [
      {
        data: chartData.map((d) => d.value),
        backgroundColor: chartData.map((d) => d.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 2,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 12,
          font: {
            size: 11,
          },
          generateLabels: showPercentagesInLegend
            ? (chart: any) => {
                return chart.data.labels.map((label: string, index: number) => {
                  const value = chartData[index].value;
                  return {
                    text: `${label}: ${value.toFixed(1)}%`,
                    fillStyle: chartData[index].color,
                    strokeStyle: '#ffffff',
                    lineWidth: 2,
                    index: index,
                  };
                });
              }
            : undefined,
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
    onResize: (chart: any) => {
      chart.canvas.style.height = chart.canvas.style.height;
      chart.canvas.style.width = chart.canvas.style.width;
    },
  };

  return (
    <div className="mb-8">
      {title && <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>}
      <div className={`${sizeClasses[size]} mx-auto relative`}>
        <Pie data={chartConfig} options={options} />
      </div>
    </div>
  );
}