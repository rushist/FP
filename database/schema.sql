-- ===================================================================
-- Employee Compensation Service
-- Database Schema Script (Microsoft SQL Server / Azure SQL Database)
-- ===================================================================

-- 1. Drop existing tables if they exist (for idempotent execution)
IF OBJECT_ID('dbo.Employee', 'U') IS NOT NULL
    DROP TABLE dbo.Employee;
GO

IF OBJECT_ID('dbo.Department', 'U') IS NOT NULL
    DROP TABLE dbo.Department;
GO

-- 2. Create Department Table
CREATE TABLE dbo.Department (
    DepartmentID    INT IDENTITY(1, 1) NOT NULL,
    DepartmentName  NVARCHAR(100) NOT NULL,
    Location        NVARCHAR(100) NULL,
    CONSTRAINT PK_Department PRIMARY KEY CLUSTERED (DepartmentID)
);
GO

-- 3. Create Employee Table with required constraints
CREATE TABLE dbo.Employee (
    EmployeeID      INT IDENTITY(101, 1) NOT NULL,
    FirstName       NVARCHAR(50) NOT NULL,
    LastName        NVARCHAR(50) NOT NULL,
    DepartmentID    INT NOT NULL,
    Salary          DECIMAL(12, 2) NOT NULL,
    Bonus           DECIMAL(12, 2) NULL,
    HireDate        DATE NOT NULL,
    CONSTRAINT PK_Employee PRIMARY KEY CLUSTERED (EmployeeID),
    CONSTRAINT FK_Employee_Department FOREIGN KEY (DepartmentID)
        REFERENCES dbo.Department (DepartmentID)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,
    CONSTRAINT CK_Employee_Salary CHECK (Salary > 0),
    CONSTRAINT CK_Employee_Bonus CHECK (Bonus >= 0 OR Bonus IS NULL),
    CONSTRAINT CK_Employee_HireDate CHECK (HireDate <= CAST(GETDATE() AS DATE))
);
GO

-- 4. Create required index on Employee.DepartmentID
CREATE NONCLUSTERED INDEX IX_Employee_DepartmentID
    ON dbo.Employee (DepartmentID);
GO
