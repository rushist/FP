import * as http from 'http';
import { URL } from 'url';
import { HttpRequest, InvocationContext } from '@azure/functions';

// Import all handlers
import { healthHandler } from './functions/health';
import { createEmployeeHandler } from './functions/employees/createEmployee';
import { getEmployeeHandler } from './functions/employees/getEmployee';
import { listEmployeesHandler } from './functions/employees/listEmployees';
import { updateEmployeeHandler } from './functions/employees/updateEmployee';
import { deleteEmployeeHandler } from './functions/employees/deleteEmployee';
import { listDepartmentsHandler } from './functions/departments/listDepartments';
import { totalBonusHandler } from './functions/reports/totalBonus';
import { employeesWithoutBonusHandler } from './functions/reports/employeesWithoutBonus';
import { bonusPercentageHandler } from './functions/reports/bonusPercentage';
import { departmentBonusReportHandler } from './functions/reports/departmentBonusReport';
import { bonusRankingHandler } from './functions/reports/bonusRanking';
import { highestCompensationHandler } from './functions/reports/highestCompensation';
import { db } from './database/connection';

const PORT = parseInt(process.env.PORT || '7071', 10);

async function startServer() {
  await db.initialize();

  const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname.replace(/\/+$/, '');
    const method = (req.method || 'GET').toUpperCase();

    // Read request body
    let bodyBuffer = Buffer.from([]);
    for await (const chunk of req) {
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
    }
    const bodyText = bodyBuffer.toString('utf-8');

    // Create HttpRequest-compatible object
    const azureReq = {
      method,
      url: parsedUrl.toString(),
      headers: new Headers(req.headers as Record<string, string>),
      query: parsedUrl.searchParams,
      params: {} as Record<string, string>,
      json: async () => (bodyText ? JSON.parse(bodyText) : {}),
      text: async () => bodyText,
    } as unknown as HttpRequest;

    const mockContext = {
      invocationId: Math.random().toString(36).substring(2),
      functionName: 'localFunction',
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    } as unknown as InvocationContext;

    try {
      let response = null;

      // Routing
      if (method === 'GET' && pathname === '/api/health') {
        response = await healthHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/departments') {
        response = await listDepartmentsHandler(azureReq, mockContext);
      } else if (method === 'POST' && pathname === '/api/employees') {
        response = await createEmployeeHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/employees') {
        response = await listEmployeesHandler(azureReq, mockContext);
      } else if (pathname.startsWith('/api/employees/')) {
        const id = pathname.substring('/api/employees/'.length);
        (azureReq as any).params = { id };
        if (method === 'GET') {
          response = await getEmployeeHandler(azureReq, mockContext);
        } else if (method === 'PUT') {
          response = await updateEmployeeHandler(azureReq, mockContext);
        } else if (method === 'DELETE') {
          response = await deleteEmployeeHandler(azureReq, mockContext);
        }
      } else if (method === 'GET' && pathname === '/api/reports/total-bonus') {
        response = await totalBonusHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/reports/no-bonus') {
        response = await employeesWithoutBonusHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/reports/bonus-percentage') {
        response = await bonusPercentageHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/reports/departments/bonus-vs-salary') {
        response = await departmentBonusReportHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/reports/bonus-ranking') {
        response = await bonusRankingHandler(azureReq, mockContext);
      } else if (method === 'GET' && pathname === '/api/reports/highest-compensation') {
        response = await highestCompensationHandler(azureReq, mockContext);
      }

      if (!response) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Route not found' } }));
        return;
      }

      const status = response.status || 200;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (response.headers) {
        if (typeof (response.headers as any).forEach === 'function') {
          (response.headers as any).forEach((value: string, key: string) => {
            headers[key] = value;
          });
        } else {
          Object.assign(headers, response.headers);
        }
      }

      res.writeHead(status, headers);
      if (response.jsonBody !== undefined) {
        res.end(JSON.stringify(response.jsonBody));
      } else if (response.body !== undefined) {
        res.end(response.body);
      } else {
        res.end();
      }
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'INTERNAL_SERVER_ERROR', message: err?.message || 'Server error' } }));
    }
  });

  server.listen(PORT, () => {
    console.log(`Employee Compensation Service local server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
