import React, { useState, useEffect, useRef } from 'react';
import { Search, Users, Building2, IndianRupee, X } from 'lucide-react';
import { apiClient } from '../api/client';
import { Employee } from '../types/employee';
import { formatINR, getDepartmentColor } from '../utils/formatters';

interface TopBannerProps {
  onNavigate: (page: string, employeeId?: number) => void;
}

export const TopBanner: React.FC<TopBannerProps> = ({ onNavigate }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [totalDepartments, setTotalDepartments] = useState(5);
  const [totalBonus, setTotalBonus] = useState(185000);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load employees and bonus data for quick search and KPI ticker
  useEffect(() => {
    async function loadData() {
      try {
        const [empData, deptData, bonusData] = await Promise.all([
          apiClient.getEmployees(),
          apiClient.getDepartments(),
          apiClient.getTotalBonusReport(),
        ]);
        setEmployees(empData);
        setTotalDepartments(deptData.length);
        setTotalBonus(bonusData.totalBonus);
      } catch {
        // Fallback silently if offline
      }
    }
    loadData();
  }, []);

  // Keyboard shortcut listener for '/'
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        )
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        searchInputRef.current?.blur();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEmployees = searchQuery.trim()
    ? employees.filter((e) => {
        const query = searchQuery.toLowerCase();
        const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
        const idMatch = e.employeeId.toString().includes(query);
        const deptMatch = (e.departmentName || '').toLowerCase().includes(query);
        return fullName.includes(query) || idMatch || deptMatch;
      })
    : [];

  function handleSelectEmployee(employeeId: number) {
    onNavigate('employee-details', employeeId);
    setSearchQuery('');
    setIsFocused(false);
  }

  return (
    <header className="app-header">
      {/* Item 1: Global Quick Search with '/' shortcut */}
      <div
        ref={searchContainerRef}
        style={{
          position: 'relative',
          width: '540px',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            className="navbar-search-input"
            placeholder="Search employee by name or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFocused(true);
            }}
            onFocus={() => setIsFocused(true)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={14} />
            </button>
          ) : (
            <kbd
              style={{
                position: 'absolute',
                right: '10px',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.725rem',
                fontFamily: 'monospace',
                pointerEvents: 'none',
              }}
            >
              /
            </kbd>
          )}
        </div>

        {/* Autocomplete Search Dropdown */}
        {isFocused && searchQuery.trim().length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              zIndex: 1000,
              maxHeight: '340px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            {filteredEmployees.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                No employees matching "<strong>{searchQuery}</strong>"
              </div>
            ) : (
              <div>
                <div
                  style={{
                    padding: '6px 10px',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Matching Employees ({filteredEmployees.length})
                </div>
                {filteredEmployees.map((emp) => {
                  const deptColor = getDepartmentColor(emp.departmentName);
                  return (
                    <div
                      key={emp.employeeId}
                      onClick={() => handleSelectEmployee(emp.employeeId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background-color 0.12s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: deptColor.bg,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: deptColor.text }}>
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            ID: {emp.employeeId} • {emp.departmentName}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--color-text)' }}>
                          {formatINR(emp.salary)}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-subtle)' }}>
                          Bonus: {emp.bonus !== null ? formatINR(emp.bonus) : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side container: Item 3 (Quick Metric Strip) & Item 5 (Region Badge) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Item 3: Quick Metric Strip (Mini KPI Ticker) */}
        <div className="navbar-kpi-strip">
          <div className="navbar-kpi-item" title="Total Staff Count">
            <Users size={14} color="#60a5fa" />
            <span>
              <strong>{employees.length > 0 ? employees.length : 24}</strong> Staff
            </span>
          </div>

          <div className="navbar-kpi-divider" />

          <div className="navbar-kpi-item" title="Total Departments">
            <Building2 size={14} color="#a78bfa" />
            <span>
              <strong>{totalDepartments}</strong> Depts
            </span>
          </div>

          <div className="navbar-kpi-divider" />

          <div className="navbar-kpi-item" title="Total Company Bonus Pool">
            <IndianRupee size={14} color="#34d399" />
            <span>
              <strong>{formatINR(totalBonus)}</strong> Pool
            </span>
          </div>
        </div>

        <div className="navbar-kpi-divider" />

        {/* Item 5: Financial Year & Currency Badge */}
        <div className="navbar-region-badge">
          <span style={{ fontSize: '1rem', lineHeight: 1 }}>🇮🇳</span>
          <span style={{ fontWeight: 600 }}>INR (₹)</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>FY 2026–27</span>
        </div>
      </div>
    </header>
  );
};
