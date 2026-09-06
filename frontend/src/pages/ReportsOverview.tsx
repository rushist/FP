import React from 'react';
import {
  IndianRupee,
  UserX,
  Percent,
  Building2,
  Trophy,
  Star,
} from 'lucide-react';
import { ReportDropdown } from '../components/ReportDropdown';

export type ReportType =
  | 'total-bonus'
  | 'no-bonus'
  | 'bonus-percentage'
  | 'bonus-vs-salary'
  | 'bonus-ranking'
  | 'highest-compensation';

interface ReportsOverviewProps {
  onSelectReport: (report: ReportType) => void;
}

export const ReportsOverview: React.FC<ReportsOverviewProps> = ({ onSelectReport }) => {
  const cards = [
    {
      id: 'total-bonus' as ReportType,
      title: 'Total Bonus',
      desc: 'View total bonus across all employees in INR',
      icon: <IndianRupee size={22} />,
      color: '#059669',
      bg: '#ecfdf5',
      border: '#a7f3d0',
    },
    {
      id: 'no-bonus' as ReportType,
      title: 'Employees Without Bonus',
      desc: 'Find employees with no bonus (Bonus IS NULL)',
      icon: <UserX size={22} />,
      color: '#d97706',
      bg: '#fffbeb',
      border: '#fde68a',
    },
    {
      id: 'bonus-percentage' as ReportType,
      title: 'Bonus Percentage',
      desc: 'View bonus as a percentage of salary',
      icon: <Percent size={22} />,
      color: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      id: 'bonus-vs-salary' as ReportType,
      title: 'Department Bonus v Salary',
      desc: 'Departments where total bonus exceeds average salary',
      icon: <Building2 size={22} />,
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
    },
    {
      id: 'bonus-ranking' as ReportType,
      title: 'Bonus Ranking',
      desc: 'Rank employees by bonus amount (NULLs last)',
      icon: <Trophy size={22} />,
      color: '#ca8a04',
      bg: '#fefce8',
      border: '#fef08a',
    },
    {
      id: 'highest-compensation' as ReportType,
      title: 'Highest Compensation',
      desc: 'Compare highest salary and total compensation',
      icon: <Star size={22} />,
      color: '#e11d48',
      bg: '#fff1f2',
      border: '#fecdd3',
    },
  ];

  return (
    <div>
      <div className="content-header">
        <div>
          <h2 className="page-title">Compensation Reports</h2>
          <p className="page-subtitle">Analyze compensation data and insights</p>
        </div>

        {/* Top Right Actions: Dropdown Menu and Admin Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ReportDropdown
            onSelectReport={onSelectReport}
          />
          <div className="user-badge">
            <div className="user-avatar-small">AD</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* 3x2 Grid of Report Cards with vibrant colored icons */}
      <div className="reports-grid">
        {cards.map((r) => (
          <div
            key={r.id}
            className="report-card"
            onClick={() => onSelectReport(r.id)}
            style={{
              transition: 'all 0.2s ease',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = r.color;
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div
              className="report-card-icon"
              style={{
                backgroundColor: r.bg,
                border: `1px solid ${r.border}`,
                color: r.color,
              }}
            >
              {r.icon}
            </div>
            <div>
              <h3 className="report-card-title" style={{ fontSize: '1.025rem' }}>
                {r.title}
              </h3>
              <p className="report-card-desc" style={{ marginTop: '4px' }}>
                {r.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
