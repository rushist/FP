import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmployeeService } from '../../services/EmployeeService';
import { createdResponse, errorResponse } from '../../utils/httpResponse';

const employeeService = new EmployeeService();

export async function createEmployeeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const result = await employeeService.createEmployee(body);
    return createdResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('createEmployee', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'employees',
  handler: createEmployeeHandler,
});
