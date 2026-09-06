import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ReportType } from './ReportsOverview';
import { apiClient } from '../api/client';
import {
  TotalBonusReport,
  BonusPercentageItem,
  DepartmentBonusVsSalaryItem,
  BonusRankingItem,
  HighestCompensationReport,
} from '../types/report';
import { Employee } from '../types/employee';
import { formatINR, getDepartmentColor } from '../utils/formatters';
import { ReportDropdown } from '../components/ReportDropdown';

interface ReportViewProps {
  reportType: ReportType;
  onBack: () => void;
  onSelectReport: (report: ReportType) => void;
}

const REPORT_INFO: Record<ReportType, { title: string; subtitle: string }> = {
  'total-bonus': {
    title: 'Total Company Bonus',
    subtitle: 'Total bonus amount across all employees in INR (NULL bonuses counted as zero)',
  },
  'no-bonus': {
    title: 'Employees Without Bonus',
    subtitle: 'Employees where Bonus is NULL (employees with ₹0 bonus are not included)',
  },
  'bonus-percentage': {
    title: 'Bonus as Percentage of Salary',
    subtitle: 'Calculated as (Bonus / Salary) * 100 rounded to 2 decimal places (excludes NULL bonuses)',
  },
  'bonus-vs-salary': {
    title: 'Department Bonus vs Average Salary',
    subtitle: 'Departments where Total Department Bonus exceeds Department Average Salary',
  },
  'bonus-ranking': {
    title: 'Employee Bonus Ranking',
    subtitle: 'Employees ranked by bonus amount (NULL bonuses shown last)',
  },
  'highest-compensation': {
    title: 'Highest Compensation Comparison',
    subtitle: 'Compare employee with highest base salary against highest total compensation',
  },
};

export const ReportView: React.FC<ReportViewProps> = ({
  reportType,
  onBack,
  onSelectReport,
}) => {
  const [totalBonusData, setTotalBonusData] = useState<TotalBonusReport | null>(null);
  const [noBonusData, setNoBonusData] = useState<Employee[]>([]);
  const [bonusPctData, setBonusPctData] = useState<BonusPercentageItem[]>([]);
  const [deptVsSalaryData, setDeptVsSalaryData] = useState<DepartmentBonusVsSalaryItem[]>([]);
  const [rankingData, setRankingData] = useState<BonusRankingItem[]>([]);
  const [highestCompData, setHighestCompData] = useState<HighestCompensationReport | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        setError(null);

        switch (reportType) {
          case 'total-bonus':
            setTotalBonusData(await apiClient.getTotalBonusReport());
            break;
          case 'no-bonus':
            setNoBonusData(await apiClient.getEmployeesWithoutBonus());
            break;
          case 'bonus-percentage':
            setBonusPctData(await apiClient.getBonusPercentages());
            break;
          case 'bonus-vs-salary':
            setDeptVsSalaryData(await apiClient.getDepartmentBonusVsSalary());
            break;
          case 'bonus-ranking':
            setRankingData(await apiClient.getBonusRanking());
            break;
          case 'highest-compensation':
            setHighestCompData(await apiClient.getHighestCompensationReport());
            break;
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load report');
      } finally {
        setIsLoading(false);
      }
    }

    loadReport();
  }, [reportType]);

  const currentInfo = REPORT_INFO[reportType];

  return (
    <div>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Reports Overview
      </button>

      {/* Top Header with title, subtitle, and top-right dropdown report selector */}
      <div className="content-header">
        <div>
          <h2 className="page-title">{currentInfo.title}</h2>
          <p className="page-subtitle">{currentInfo.subtitle}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ReportDropdown
            currentReport={reportType}
            onSelectReport={onSelectReport}
            onSelectOverview={onBack}
          />
          <div className="user-badge">
            <div className="user-avatar-small">AD</div>
            <span>Admin</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Screen 8: Total Bonus Report */}
      {reportType === 'total-bonus' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : totalBonusData && (
            <div>
              <div className="kpi-card" style={{ maxWidth: '320px', marginBottom: '24px' }}>
                <div className="kpi-title">Total Company Bonus (INR)</div>
                <div className="kpi-value" style={{ color: 'var(--color-primary)' }}>
                  {formatINR(totalBonusData.totalBonus)}
                </div>
              </div>

              <div className="card">
                <h3 className="card-title">Bonus by Department</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total Bonus (INR)</th>
                      <th>Employee Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalBonusData.byDepartment.map((d) => {
                      const deptColor = getDepartmentColor(d.departmentName);
                      return (
                        <tr key={d.departmentId}>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: deptColor.bg,
                                  display: 'inline-block',
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                                {d.departmentName}
                              </span>
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: deptColor.text }}>
                            {formatINR(d.totalBonus)}
                          </td>
                          <td>{d.employeeCount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screen 9: Bonus Ranking Report */}
      {reportType === 'bonus-ranking' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Rank</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Salary (INR)</th>
                    <th>Bonus (INR)</th>
                    <th>Total Compensation (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingData.map((item, idx) => {
                    const deptColor = getDepartmentColor(item.department);
                    return (
                      <tr key={`${item.employeeId}-${idx}`}>
                        <td
                          style={{
                            fontWeight: 700,
                            color: item.rank === '-' ? 'var(--color-text-subtle)' : 'var(--color-primary)',
                          }}
                        >
                          {item.rank}
                        </td>
                        <td style={{ fontWeight: 600, color: deptColor.text }}>
                          {item.name}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: deptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                              {item.department}
                            </span>
                          </span>
                        </td>
                        <td>{formatINR(item.salary)}</td>
                        <td style={{ fontWeight: 600, color: deptColor.text }}>
                          {item.bonus !== null ? (
                            formatINR(item.bonus)
                          ) : (
                            <span style={{ color: 'var(--color-text-subtle)' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatINR(item.totalCompensation)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Employees Without Bonus Report */}
      {reportType === 'no-bonus' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : noBonusData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
              No employees found without bonus
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Salary (INR)</th>
                    <th>Bonus</th>
                    <th>Hire Date</th>
                  </tr>
                </thead>
                <tbody>
                  {noBonusData.map((rawEmp: any) => {
                    const empId = rawEmp.employeeId ?? rawEmp.EmployeeID;
                    const firstName = rawEmp.firstName ?? rawEmp.FirstName ?? '';
                    const lastName = rawEmp.lastName ?? rawEmp.LastName ?? '';
                    const deptName = rawEmp.departmentName ?? rawEmp.DepartmentName ?? '—';
                    const salary = rawEmp.salary ?? rawEmp.Salary;
                    const hireDate = rawEmp.hireDate ?? rawEmp.HireDate;
                    const deptColor = getDepartmentColor(deptName);
                    return (
                      <tr key={empId}>
                        <td style={{ fontWeight: 600 }}>{empId}</td>
                        <td style={{ fontWeight: 600, color: deptColor.text }}>
                          {firstName} {lastName}
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: deptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                              {deptName}
                            </span>
                          </span>
                        </td>
                        <td>{formatINR(salary)}</td>
                        <td>
                          <span style={{ color: 'var(--color-text-subtle)', fontWeight: 600 }}>
                            NULL (No Bonus)
                          </span>
                        </td>
                        <td>{hireDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bonus Percentage Report */}
      {reportType === 'bonus-percentage' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Salary (INR)</th>
                    <th>Bonus (INR)</th>
                    <th>Bonus %</th>
                  </tr>
                </thead>
                <tbody>
                  {bonusPctData.map((item) => {
                    const deptColor = getDepartmentColor(item.department);
                    return (
                      <tr key={item.employeeId}>
                        <td style={{ fontWeight: 600 }}>{item.employeeId}</td>
                        <td style={{ fontWeight: 600, color: deptColor.text }}>{item.name}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: deptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                              {item.department}
                            </span>
                          </span>
                        </td>
                        <td>{formatINR(item.salary)}</td>
                        <td style={{ fontWeight: 500 }}>{formatINR(item.bonus)}</td>
                        <td style={{ fontWeight: 700, color: deptColor.text }}>
                          {item.bonusPercentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Department Bonus vs Salary Report */}
      {reportType === 'bonus-vs-salary' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : deptVsSalaryData.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
              No departments found where Total Bonus &gt; Average Salary
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Total Bonus (INR)</th>
                    <th>Average Salary (INR)</th>
                    <th>Surplus (Bonus - Avg Salary)</th>
                    <th>Employee Count</th>
                  </tr>
                </thead>
                <tbody>
                  {deptVsSalaryData.map((d) => {
                    const deptColor = getDepartmentColor(d.departmentName);
                    return (
                      <tr key={d.departmentId}>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: deptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                              {d.departmentName}
                            </span>
                          </span>
                        </td>
                        <td style={{ color: deptColor.text, fontWeight: 700 }}>
                          {formatINR(d.totalBonus)}
                        </td>
                        <td>{formatINR(d.averageSalary)}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>
                          +{formatINR(d.totalBonus - d.averageSalary)}
                        </td>
                        <td>{d.employeeCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Highest Compensation Report */}
      {reportType === 'highest-compensation' && (
        <div>
          {isLoading ? (
            <div style={{ padding: '32px' }}>Loading report...</div>
          ) : highestCompData && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Highest Salary Employee */}
                {(() => {
                  const sDeptColor = getDepartmentColor(highestCompData.highestSalaryEmployee?.department);
                  return (
                    <div className="card" style={{ borderTop: `4px solid ${sDeptColor.bg}` }}>
                      <div className="kpi-title" style={{ fontSize: '0.9rem' }}>Highest Base Salary Employee</div>
                      {highestCompData.highestSalaryEmployee ? (
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '8px 0 4px 0', color: sDeptColor.text }}>
                            {highestCompData.highestSalaryEmployee.name}
                          </h3>
                          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: sDeptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                              {highestCompData.highestSalaryEmployee.department} (ID: {highestCompData.highestSalaryEmployee.employeeId})
                            </span>
                          </div>
                          <div className="details-key-value-list">
                            <div className="details-label">Base Salary:</div>
                            <div className="details-value">{formatINR(highestCompData.highestSalaryEmployee.salary)}</div>
                            <div className="details-label">Bonus:</div>
                            <div className="details-value">
                              {highestCompData.highestSalaryEmployee.bonus !== null
                                ? formatINR(highestCompData.highestSalaryEmployee.bonus)
                                : '—'}
                            </div>
                            <div className="details-label">Total Comp:</div>
                            <div className="details-value" style={{ color: sDeptColor.text, fontWeight: 700 }}>
                              {formatINR(highestCompData.highestSalaryEmployee.totalCompensation)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>No employee records available</div>
                      )}
                    </div>
                  );
                })()}

                {/* Highest Total Compensation Employee */}
                {(() => {
                  const cDeptColor = getDepartmentColor(highestCompData.highestTotalCompensationEmployee?.department);
                  return (
                    <div className="card" style={{ borderTop: `4px solid ${cDeptColor.bg}` }}>
                      <div className="kpi-title" style={{ fontSize: '0.9rem' }}>Highest Total Compensation Employee</div>
                      {highestCompData.highestTotalCompensationEmployee ? (
                        <div>
                          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '8px 0 4px 0', color: cDeptColor.text }}>
                            {highestCompData.highestTotalCompensationEmployee.name}
                          </h3>
                          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: cDeptColor.bg,
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                              {highestCompData.highestTotalCompensationEmployee.department} (ID: {highestCompData.highestTotalCompensationEmployee.employeeId})
                            </span>
                          </div>
                          <div className="details-key-value-list">
                            <div className="details-label">Base Salary:</div>
                            <div className="details-value">{formatINR(highestCompData.highestTotalCompensationEmployee.salary)}</div>
                            <div className="details-label">Bonus:</div>
                            <div className="details-value">
                              {highestCompData.highestTotalCompensationEmployee.bonus !== null
                                ? formatINR(highestCompData.highestTotalCompensationEmployee.bonus)
                                : '—'}
                            </div>
                            <div className="details-label">Total Comp:</div>
                            <div className="details-value" style={{ color: cDeptColor.text, fontWeight: 700 }}>
                              {formatINR(highestCompData.highestTotalCompensationEmployee.totalCompensation)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>No employee records available</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
