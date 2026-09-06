import React, { useState } from 'react';
import { getDepartmentColor } from '../utils/formatters';

interface PieSliceData {
  name: string;
  count: number;
}

interface DepartmentPieChartProps {
  data: PieSliceData[];
}

export const DepartmentPieChart: React.FC<DepartmentPieChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
        No department data available
      </div>
    );
  }

  // Calculate angles
  let accumulatedAngle = 0;
  const slices = data.map((item, idx) => {
    const percentage = item.count / total;
    const angle = percentage * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    // Convert angles to SVG coordinates (circle radius 80, center 100, 100)
    const radius = 75;
    const cx = 100;
    const cy = 100;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      percentage >= 0.999
        ? `M ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const color = getDepartmentColor(item.name);

    return {
      ...item,
      percentage: Math.round(percentage * 100),
      pathData,
      color: color.bg,
      textColor: color.text,
      lightBg: color.lightBg,
      index: idx,
    };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '24px', flexWrap: 'wrap' }}>
      {/* SVG Pie Chart */}
      <div style={{ position: 'relative', width: '200px', height: '200px' }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <path
                key={slice.name}
                d={slice.pathData}
                fill={slice.color}
                stroke="#ffffff"
                strokeWidth={isHovered ? '3' : '1.5'}
                opacity={hoveredIndex === null || isHovered ? 1 : 0.65}
                style={{
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, opacity 0.15s ease',
                  transformOrigin: '100px 100px',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
          {/* Inner cutout for a clean donut look */}
          <circle cx="100" cy="100" r="38" fill="#ffffff" />
          <text
            x="100"
            y="96"
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="var(--color-text)"
          >
            {hoveredIndex !== null ? slices[hoveredIndex].count : total}
          </text>
          <text
            x="100"
            y="112"
            textAnchor="middle"
            fontSize="10"
            fontWeight="500"
            fill="var(--color-text-muted)"
          >
            {hoveredIndex !== null ? slices[hoveredIndex].name : 'Employees'}
          </text>
        </svg>
      </div>

      {/* Legend with matching Department colors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
        {slices.map((slice) => {
          const isHovered = hoveredIndex === slice.index;
          return (
            <div
              key={slice.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: isHovered ? slice.lightBg : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={() => setHoveredIndex(slice.index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: slice.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: isHovered ? 700 : 500,
                    color: slice.color,
                  }}
                >
                  {slice.name}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text)' }}>
                  {slice.count}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                  ({slice.percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
