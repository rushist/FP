import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { DepartmentRepository } from '../../repositories/DepartmentRepository';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const departmentRepo = new DepartmentRepository();

export async function listDepartmentsHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const departments = await departmentRepo.getAll();
    return okResponse(departments);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('listDepartments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'departments',
  handler: listDepartmentsHandler,
});
