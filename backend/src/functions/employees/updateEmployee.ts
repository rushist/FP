import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmployeeService } from '../../services/EmployeeService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const employeeService = new EmployeeService();

export async function updateEmployeeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const idParam = request.params.id;
    const id = parseInt(idParam, 10);
    const body = await request.json();
    const result = await employeeService.updateEmployee(id, body);
    return okResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('updateEmployee', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'employees/{id}',
  handler: updateEmployeeHandler,
});
