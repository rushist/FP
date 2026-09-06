import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmployeeService } from '../../services/EmployeeService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const employeeService = new EmployeeService();

export async function getEmployeeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const idParam = request.params.id;
    const id = parseInt(idParam, 10);
    const result = await employeeService.getEmployeeById(id);
    return okResponse(result);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('getEmployee', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'employees/{id}',
  handler: getEmployeeHandler,
});
