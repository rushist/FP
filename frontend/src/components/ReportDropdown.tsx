import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  IndianRupee,
  UserX,
  Percent,
  Building2,
  Trophy,
  Star,
  LayoutGrid,
} from 'lucide-react';
import { ReportType } from '../pages/ReportsOverview';

export interface ReportOption {
  id: ReportType;
  title: string;
  shortDesc: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

export const REPORT_OPTIONS: ReportOption[] = [
  {
    id: 'total-bonus',
    title: 'Total Bonus',
    shortDesc: 'Company & department totals',
    icon: <IndianRupee size={16} />,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
  {
    id: 'no-bonus',
    title: 'Employees Without Bonus',
    shortDesc: 'Bonus IS NULL records',
    icon: <UserX size={16} />,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    id: 'bonus-percentage',
    title: 'Bonus Percentage',
    shortDesc: '(Bonus / Salary) * 100',
    icon: <Percent size={16} />,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    id: 'bonus-vs-salary',
    title: 'Department Bonus v Salary',
    shortDesc: 'Bonus > Average salary',
    icon: <Building2 size={16} />,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    id: 'bonus-ranking',
    title: 'Bonus Ranking',
    shortDesc: 'Ranked with NULLs last',
    icon: <Trophy size={16} />,
    color: '#ca8a04',
    bg: '#fefce8',
    border: '#fef08a',
  },
  {
    id: 'highest-compensation',
    title: 'Highest Compensation',
    shortDesc: 'Highest salary vs total comp',
    icon: <Star size={16} />,
    color: '#e11d48',
    bg: '#fff1f2',
    border: '#fecdd3',
  },
];

interface ReportDropdownProps {
  currentReport?: ReportType | null;
  onSelectReport: (report: ReportType) => void;
  onSelectOverview?: () => void;
}

export const ReportDropdown: React.FC<ReportDropdownProps> = ({
  currentReport,
  onSelectReport,
  onSelectOverview,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = REPORT_OPTIONS.find((r) => r.id === currentReport);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'inherit',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
        }}
      >
        {activeOption ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '4px',
              backgroundColor: activeOption.bg,
              color: activeOption.color,
            }}
          >
            {activeOption.icon}
          </span>
        ) : (
          <LayoutGrid size={16} color="var(--color-primary)" />
        )}
        <span>{activeOption ? activeOption.title : 'Select Report'}</span>
        <ChevronDown size={14} color="var(--color-text-muted)" />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: '290px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-border)',
            zIndex: 1000,
            padding: '6px',
          }}
        >
          {onSelectOverview && (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectOverview();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: !currentReport ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '0.825rem',
                  fontWeight: !currentReport ? 700 : 500,
                  color: 'var(--color-text)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    color: 'var(--color-text)',
                  }}
                >
                  <LayoutGrid size={16} />
                </span>
                <div>
                  <div style={{ fontWeight: 600 }}>All Reports Overview</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                    View all 6 report cards
                  </div>
                </div>
              </button>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
            </>
          )}

          {REPORT_OPTIONS.map((opt) => {
            const isSelected = opt.id === currentReport;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSelectReport(opt.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: isSelected ? opt.bg : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '0.825rem',
                  color: 'var(--color-text)',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: opt.bg,
                    border: `1px solid ${opt.border}`,
                    color: opt.color,
                    flexShrink: 0,
                  }}
                >
                  {opt.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: isSelected ? 700 : 600, color: isSelected ? opt.color : 'var(--color-text)' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                    {opt.shortDesc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
