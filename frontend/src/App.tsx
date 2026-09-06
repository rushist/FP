import React, { useState } from 'react';
import { TopBanner } from './components/TopBanner';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { AddEmployee } from './pages/AddEmployee';
import { EditEmployee } from './pages/EditEmployee';
import { EmployeeDetails } from './pages/EmployeeDetails';
import { ReportsOverview, ReportType } from './pages/ReportsOverview';
import { ReportView } from './pages/ReportView';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>('total-bonus');

  // Compute active sidebar tab
  let activeTab: ActiveTab = 'dashboard';
  if (['employees', 'add-employee', 'edit-employee', 'employee-details'].includes(currentPage)) {
    activeTab = 'employees';
  } else if (['reports', 'report-detail'].includes(currentPage)) {
    activeTab = 'reports';
  }

  function handleNavigate(page: string, employeeId?: number) {
    if (employeeId !== undefined) {
      setSelectedEmployeeId(employeeId);
    }
    if (page === 'reports') {
      setSelectedReportType('total-bonus');
      setCurrentPage('report-detail');
      return;
    }
    setCurrentPage(page);
  }

  function handleSelectTab(tab: ActiveTab) {
    if (tab === 'reports') {
      setSelectedReportType('total-bonus');
      setCurrentPage('report-detail');
    } else {
      setCurrentPage(tab);
    }
  }

  function handleSelectReport(report: ReportType) {
    setSelectedReportType(report);
    setCurrentPage('report-detail');
  }

  return (
    <div>
      <TopBanner onNavigate={handleNavigate} />
      <div className="app-container">
        <Sidebar activeTab={activeTab} onSelectTab={handleSelectTab} />
        <main className="main-content">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === 'employees' && <Employees onNavigate={handleNavigate} />}
          {currentPage === 'add-employee' && <AddEmployee onNavigate={handleNavigate} />}
          {currentPage === 'edit-employee' && selectedEmployeeId && (
            <EditEmployee employeeId={selectedEmployeeId} onNavigate={handleNavigate} />
          )}
          {currentPage === 'employee-details' && selectedEmployeeId && (
            <EmployeeDetails employeeId={selectedEmployeeId} onNavigate={handleNavigate} />
          )}
          {currentPage === 'reports' && (
            <ReportsOverview onSelectReport={handleSelectReport} />
          )}
          {currentPage === 'report-detail' && selectedReportType && (
            <ReportView
              reportType={selectedReportType}
              onBack={() => setCurrentPage('reports')}
              onSelectReport={handleSelectReport}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
