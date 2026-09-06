# Employee Compensation Service

A production-minded, modular **Employee Compensation Service** built with Azure Functions (v4 TypeScript HTTP Triggers), a relational SQL database layer (Azure SQL / Microsoft SQL Server compatible), parameterized queries, comprehensive business logic, and a minimal administration UI.

---

## Architecture

```text
Frontend UI (Work Sans, React + Vite)
            │
            │ HTTP (Port 3000 -> 7071)
            ▼
Azure Functions (HTTP Triggers v4)
            │
            ▼
Service Layer (EmployeeService, CompensationService)
            │
            ▼
Repository / Data Access Layer (EmployeeRepository, DepartmentRepository, CompensationRepository)
            │
            ▼
Azure SQL Database / Microsoft SQL Server
```

### Layer Responsibilities
- **Azure Functions**: Ingress HTTP handlers that parse requests, validate parameters, invoke services, and return standardized HTTP responses.
- **Service Layer**: Pure business logic, input validation orchestration, compensation calculations, and domain rules.
- **Repository Layer**: Data access isolation using parameterized SQL queries with zero direct SQL exposure to clients.
- **Database**: Constraints (`Salary > 0`, `Bonus >= 0 OR Bonus IS NULL`), foreign keys, clustered primary keys, indexes, and SQL Server aggregation semantics.

---

## Technologies -

- **Runtime**: Node.js (v22)
- **Backend**: TypeScript
- **Serverless Backend**: `@azure/functions` (v4 Programming Model)
- **DB**: Azure SQL Database / Microsoft SQL Server (compatible T-SQL DDL & DML)
- **Frontend UI**: React 18, TypeScript

---

## Project Structure

```text
fusion/
├── backend/
│   ├── src/
│   │   ├── functions/
│   │   │   ├── health.ts
│   │   │   ├── employees/
│   │   │   │   ├── createEmployee.ts
│   │   │   │   ├── getEmployee.ts
│   │   │   │   ├── listEmployees.ts
│   │   │   │   ├── updateEmployee.ts
│   │   │   │   └── deleteEmployee.ts
│   │   │   ├── departments/
│   │   │   │   └── listDepartments.ts
│   │   │   └── reports/
│   │   │       ├── totalBonus.ts
│   │   │       ├── employeesWithoutBonus.ts
│   │   │       ├── bonusPercentage.ts
│   │   │       ├── departmentBonusReport.ts
│   │   │       ├── bonusRanking.ts
│   │   │       └── highestCompensation.ts
│   │   ├── services/
│   │   │   ├── EmployeeService.ts
│   │   │   └── CompensationService.ts
│   │   ├── repositories/
│   │   │   ├── EmployeeRepository.ts
│   │   │   ├── DepartmentRepository.ts
│   │   │   └── CompensationRepository.ts
│   │   ├── models/
│   │   │   ├── Employee.ts
│   │   │   └── Department.ts
│   │   ├── dto/
│   │   │   ├── CreateEmployeeRequest.ts
│   │   │   ├── UpdateEmployeeRequest.ts
│   │   │   └── EmployeeResponse.ts
│   │   ├── validation/
│   │   │   └── employeeValidation.ts
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── sqlEngine.ts
│   │   ├── utils/
│   │   │   ├── errors.ts
│   │   │   └── httpResponse.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── validation.test.ts
│   │   ├── employeeService.test.ts
│   │   └── compensationService.test.ts
│   ├── host.json
│   ├── local.settings.json.example
│   ├── local.settings.json
│   ├── tsconfig.json
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── components/
│   │   │   ├── TopBanner.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── DeleteConfirmModal.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Employees.tsx
│   │   │   ├── AddEmployee.tsx
│   │   │   ├── EditEmployee.tsx
│   │   │   ├── EmployeeDetails.tsx
│   │   │   ├── ReportsOverview.tsx
│   │   │   └── ReportView.tsx
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## Setup & Running Locally

### Prerequisites
- Node.js (v18 or v20+ recommended, tested on v22)
- npm (v9+)
- (Optional) Azure Functions Core Tools (`func`) & Azure SQL Server instance

### 1. Database Setup (Azure SQL / MSSQL)
If connecting to Azure SQL Database or a local SQL Server:
1. Run [`database/schema.sql`](file:///c:/Users/Rushabh%20Jain/Downloads/fusion/database/schema.sql) in SQL Server Management Studio (SSMS), Azure Data Studio, or `sqlcmd`:
   ```bash
   sqlcmd -S <server> -d <database> -i database/schema.sql
   ```
2. Run [`database/seed.sql`](file:///c:/Users/Rushabh%20Jain/Downloads/fusion/database/seed.sql):
   ```bash
   sqlcmd -S <server> -d <database> -i database/seed.sql
   ```
3. Configure your connection string in `backend/local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AZURE_SQL_CONNECTION_STRING": "Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;User ID=<user>;Password=<password>;Encrypt=True;"
     }
   }
   ```
> *Note: If no connection string is configured, the service automatically falls back to an embedded SQL development engine pre-seeded with identical data and constraints, allowing instant local testing without external database dependencies.*

### 2. Backend Startup
```bash
cd backend
npm install
npm run build
npm run dev
```
The backend API server will start on `http://localhost:7071`.
*(If running with Azure Functions Core Tools, execute `func start`).*

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will start on `http://localhost:3000`.

---

## API Documentation

All API endpoints return JSON. Successful create returns `201`, successful delete returns `204`, validation failures return `400`, missing resources return `404`.

### Error Response Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Salary must be greater than zero"
  }
}
```

### Health Check
- **`GET /api/health`**
  - **Response `200 OK`**:
    ```json
    { "status": "ok" }
    ```

### Departments
- **`GET /api/departments`**
  - Returns list of all departments for UI dropdowns and filters.

### Employee CRUD

#### 1. List Employees
- **`GET /api/employees`**
- **`GET /api/employees?departmentId=1`**
  - Optional query parameter `departmentId`
  - **Response `200 OK`**:
    ```json
    [
      {
        "employeeId": 101,
        "firstName": "John",
        "lastName": "Smith",
        "departmentId": 1,
        "departmentName": "Engineering",
        "salary": 120000,
        "bonus": 10000,
        "hireDate": "2022-01-15",
        "totalCompensation": 130000
      }
    ]
    ```

#### 2. Get Employee by ID
- **`GET /api/employees/{id}`**
  - **Response `200 OK`** or **`404 Not Found`**

#### 3. Create Employee
- **`POST /api/employees`**
  - **Request Body**:
    ```json
    {
      "firstName": "Sarah",
      "lastName": "Johnson",
      "departmentId": 2,
      "salary": 95000,
      "bonus": 8000,
      "hireDate": "2021-03-22"
    }
    ```
  - **Response `201 Created`**

#### 4. Update Employee
- **`PUT /api/employees/{id}`**
  - **Request Body** (partial or full):
    ```json
    {
      "salary": 100000,
      "bonus": 12000
    }
    ```
  - **Response `200 OK`**

#### 5. Delete Employee
- **`DELETE /api/employees/{id}`**
  - **Response `204 No Content`**

---

### Compensation Reporting APIs

#### 1. Total Company Bonus
- **`GET /api/reports/total-bonus`**
  - Total bonus across all employees (`COALESCE(Bonus, 0)`) and department breakdown.
  - **Response `200 OK`**:
    ```json
    {
      "totalBonus": 185000,
      "totalEmployees": 24,
      "byDepartment": [
        { "departmentId": 1, "departmentName": "Engineering", "totalBonus": 55000, "employeeCount": 8 }
      ]
    }
    ```

#### 2. Employees Without Bonus
- **`GET /api/reports/no-bonus`**
  - Employees where `Bonus IS NULL`. (`0` bonus is NOT null).
  - **Response `200 OK`**

#### 3. Bonus as Percentage of Salary
- **`GET /api/reports/bonus-percentage`**
  - For employees with a bonus: `(Bonus / Salary) * 100` rounded to 2 decimal places. Excludes `NULL` bonuses.
  - **Response `200 OK`**:
    ```json
    [
      {
        "employeeId": 101,
        "name": "John Smith",
        "department": "Engineering",
        "salary": 120000,
        "bonus": 10000,
        "bonusPercentage": 8.33
      }
    ]
    ```

#### 4. Department Bonus vs Average Salary
- **`GET /api/reports/departments/bonus-vs-salary`**
  - Departments where `Total Bonus > Average Salary`.
  - **Response `200 OK`**:
    ```json
    [
      {
        "departmentId": 4,
        "departmentName": "Finance",
        "totalBonus": 45000,
        "averageSalary": 41250,
        "employeeCount": 4
      }
    ]
    ```

#### 5. Bonus Ranking
- **`GET /api/reports/bonus-ranking`**
  - Ranks employees by bonus descending. Employees with bonuses are ranked first (higher bonus first). Employees with `NULL` bonuses appear last with rank `'-'`.
  - **Response `200 OK`**

#### 6. Highest Salary vs Highest Total Compensation
- **`GET /api/reports/highest-compensation`**
  - Compares highest base salary employee against highest total compensation employee (`Salary + COALESCE(Bonus, 0)`).
  - **Response `200 OK`**:
    ```json
    {
      "highestSalaryEmployee": {
        "employeeId": 101,
        "name": "John Smith",
        "department": "Engineering",
        "salary": 120000,
        "bonus": 10000,
        "totalCompensation": 130000
      },
      "highestTotalCompensationEmployee": {
        "employeeId": 105,
        "name": "David Wilson",
        "department": "Finance",
        "salary": 105000,
        "bonus": 28000,
        "totalCompensation": 133000
      },
      "isSameEmployee": false
    }
    ```

---

## Documented Assumptions

1. **Department Existence**: `DepartmentID` must refer to an existing record in the `Department` table; foreign key constraint violation is caught and returned as `400 Bad Request`.
2. **Salary Positive Constraint**: Base salary must be strictly greater than zero (`Salary > 0`).
3. **Non-negative Bonus Constraint**: Bonus must be greater than or equal to zero or `NULL` (`Bonus >= 0 OR Bonus IS NULL`).
4. **Semantics of `NULL` Bonus**: `NULL` bonus signifies that no bonus has been awarded.
5. **Distinction of `0` vs `NULL`**: A bonus value of `$0.00` is an explicitly recorded zero-dollar bonus and is distinct from `NULL`. Employees with `$0.00` bonus are included in bonus percentage calculations and bonus rankings, but excluded from the "employees without bonus" report.
6. **Total Compensation Formula**: Total compensation is computed as `Salary + COALESCE(Bonus, 0)`.
7. **Ranking Order**: In bonus rankings, employees with bonuses appear first ordered by bonus descending; employees with `NULL` bonuses appear at the end.
8. **Referential Integrity**: Deleting an employee record does not cascade or delete the associated department.
9. **Optional 5% Default Bonus**: If `ENABLE_DEFAULT_FIVE_PERCENT_BONUS="true"`, any employee with a `NULL` bonus receives an effective bonus of `Salary * 0.05` calculated dynamically on read without altering the underlying database record.

---

## Testing

### Automated Test Suite
To run all automated unit and integration tests:
```bash
cd backend
npm test
```
The test suite contains **28 tests across 3 suites**:
- **`validation.test.ts`** (10 tests): Rejection of empty names, names exceeding 50 chars, non-positive salaries, negative bonuses, invalid hire dates, partial update validation.
- **`employeeService.test.ts`** (12 tests): Seeded list retrieval, filtering by department, empty department filter, getting by ID, 404 for nonexistent IDs, creating with bonus, creating with NULL bonus, department existence check, updating, deleting, and 404 handling.
- **`compensationService.test.ts`** (6 tests): Verification of all 6 reporting rules, `COALESCE(Bonus, 0)` in total bonuses, `NULL` vs `0` bonus isolation, accurate 2-decimal bonus percentages, department bonus exceeding average salary, rankings with NULLs last, and comparison of highest salary vs total compensation.
