import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { EmployeeService } from '../../services/EmployeeService';
import { noContentResponse, errorResponse } from '../../utils/httpResponse';

const employeeService = new EmployeeService();

export async function deleteEmployeeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const idParam = request.params.id;
    const id = parseInt(idParam, 10);
    await employeeService.deleteEmployee(id);
    return noContentResponse();
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('deleteEmployee', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'employees/{id}',
  handler: deleteEmployeeHandler,
});
