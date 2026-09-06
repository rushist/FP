import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CompensationService } from '../../services/CompensationService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const compensationService = new CompensationService();

export async function departmentBonusReportHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const list = await compensationService.getDepartmentBonusVsSalary();
    return okResponse(list);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('departmentBonusReport', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/departments/bonus-vs-salary',
  handler: departmentBonusReportHandler,
});
