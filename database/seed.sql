-- ===================================================================
-- Employee Compensation Service
-- Database Seed Script (Microsoft SQL Server / Azure SQL Database)
-- Seeded with Indian Tech Hubs & Indian Names
-- ===================================================================

SET NOCOUNT ON;

-- 1. Insert Departments (Identity insert to ensure stable IDs)
SET IDENTITY_INSERT dbo.Department ON;

INSERT INTO dbo.Department (DepartmentID, DepartmentName, Location)
VALUES 
    (1, 'Engineering', 'Building A - Bengaluru'),
    (2, 'Sales', 'Tower B - Mumbai'),
    (3, 'HR', 'Building A - Bengaluru'),
    (4, 'Finance', 'Cyber City - Gurugram'),
    (5, 'Operations', 'Hitec City - Hyderabad');

SET IDENTITY_INSERT dbo.Department OFF;
GO

-- 2. Insert Employees (Identity insert to match deterministic IDs starting at 101)
SET IDENTITY_INSERT dbo.Employee ON;

INSERT INTO dbo.Employee (EmployeeID, FirstName, LastName, DepartmentID, Salary, Bonus, HireDate)
VALUES
    -- Engineering (8 employees, Total Bonus = ₹55,000)
    (101, 'Aarav', 'Sharma', 1, 120000.00, 10000.00, '2022-01-15'),     -- Highest base salary (₹1,20,000)
    (103, 'Rohan', 'Verma', 1, 110000.00, NULL, '2023-07-10'),         -- NULL bonus
    (108, 'Diya', 'Mukherjee', 1, 115000.00, 10000.00, '2020-04-25'),
    (109, 'Aditya', 'Joshi', 1, 105000.00, 8000.00, '2021-08-14'),
    (110, 'Kavya', 'Nair', 1, 95000.00, 7000.00, '2022-11-01'),
    (111, 'Rahul', 'Mehta', 1, 102000.00, 9000.00, '2021-02-20'),
    (112, 'Pooja', 'Deshmukh', 1, 98000.00, 11000.00, '2023-03-15'),
    (113, 'Siddharth', 'Rao', 1, 85000.00, 0.00, '2024-01-10'),        -- Explicit 0.00 bonus (distinct from NULL)

    -- Sales (6 employees, Total Bonus = ₹48,000)
    (102, 'Priya', 'Patel', 2, 95000.00, 8000.00, '2021-03-22'),
    (106, 'Sneha', 'Kulkarni', 2, 98000.00, NULL, '2022-09-30'),      -- NULL bonus
    (114, 'Neha', 'Gupta', 2, 90000.00, 12000.00, '2020-05-19'),
    (115, 'Manish', 'Kumar', 2, 88000.00, 10000.00, '2021-10-04'),
    (116, 'Ritu', 'Sen', 2, 92000.00, 9000.00, '2022-06-11'),
    (117, 'Kunal', 'Bhatia', 2, 87000.00, 9000.00, '2023-08-22'),

    -- HR (3 employees, Total Bonus = ₹12,000)
    (104, 'Ananya', 'Iyer', 3, 80000.00, 5000.00, '2020-11-05'),
    (118, 'Meera', 'Nambiar', 3, 75000.00, 4000.00, '2022-04-18'),
    (119, 'Tanvi', 'Kapoor', 3, 72000.00, 3000.00, '2023-09-01'),

    -- Finance (4 employees, Total Bonus = ₹45,000; Avg Salary = ₹41,250 -> Total Bonus > Avg Salary)
    -- Vikram Malhotra has base ₹1,05,000 + ₹28,000 bonus = ₹1,33,000 total (Highest Total Compensation!)
    (105, 'Vikram', 'Malhotra', 4, 105000.00, 28000.00, '2019-06-18'),
    (120, 'Rajesh', 'Singhal', 4, 20000.00, 7000.00, '2022-05-12'),
    (121, 'Suresh', 'Pillai', 4, 20000.00, 6000.00, '2023-01-25'),
    (122, 'Divya', 'Chawla', 4, 20000.00, 4000.00, '2023-11-10'),

    -- Operations (3 employees, Total Bonus = ₹25,000)
    (107, 'Arjun', 'Reddy', 5, 85000.00, 7500.00, '2021-12-12'),
    (123, 'Harish', 'Chandra', 5, 82000.00, 9500.00, '2022-02-14'),
    (124, 'Varun', 'Menon', 5, 80000.00, 8000.00, '2023-05-30');

SET IDENTITY_INSERT dbo.Employee OFF;
GO
