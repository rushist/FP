// Entry point for Azure Functions v4 programming model
// Importing these registers all HTTP triggers with the runtime
import './functions/health';
import './functions/employees/listEmployees';
import './functions/employees/getEmployee';
import './functions/employees/createEmployee';
import './functions/employees/updateEmployee';
import './functions/employees/deleteEmployee';
import './functions/departments/listDepartments';
import './functions/reports/totalBonus';
import './functions/reports/departmentBonusReport';
import './functions/reports/highestCompensation';
import './functions/reports/bonusRanking';
import './functions/reports/employeesWithoutBonus';
import './functions/reports/bonusPercentage';
