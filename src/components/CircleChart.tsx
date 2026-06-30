import React from 'react';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface CircleChartProps {
  data: ChartDataItem[];
  total: number;
}

export default function CircleChart({ data, total }: CircleChartProps) {
  // If no data or total is 0, show a placeholder
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
        <span className="text-sm font-medium text-zinc-400">No data available for this selection</span>
      </div>
    );
  }

  const r = 15.9155;
  const circumference = 100;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white border border-zinc-100 rounded-xl shadow-xs">
      {/* SVG Donut Chart */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="transparent"
            stroke="#f4f4f5"
            strokeWidth="3.5"
            id="chart-bg"
          />
          {/* Slices */}
          {data.map((item, index) => {
            if (item.percentage <= 0) return null;
            const strokeDasharray = `${item.percentage} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent;
            accumulatedPercent += item.percentage;

            return (
              <circle
                key={item.name + index}
                cx="18"
                cy="18"
                r={r}
                fill="transparent"
                stroke={item.color}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:stroke-[4]"
                id={`slice-${index}`}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold text-zinc-800">{total}</span>
          <span className="text-[10px] uppercase tracking-wider font-medium text-zinc-400">Total</span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 flex-grow w-full text-xs font-sans">
        {data.map((item, index) => (
          <div key={item.name + index} className="flex items-center gap-2" id={`legend-item-${index}`}>
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex justify-between w-full gap-2">
              <span className="font-medium text-zinc-600 truncate">{item.name}</span>
              <span className="text-zinc-500 flex-shrink-0">
                {item.value} ({item.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
