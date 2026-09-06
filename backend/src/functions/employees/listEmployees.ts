import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmployeeService } from '../../services/EmployeeService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const employeeService = new EmployeeService();

export async function listEmployeesHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const departmentIdParam = request.query.get('departmentId');
    const result = await employeeService.listEmployees(departmentIdParam);
    return okResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('listEmployees', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'employees',
  handler: listEmployeesHandler,
});
