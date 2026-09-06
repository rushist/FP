import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CompensationService } from '../../services/CompensationService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const compensationService = new CompensationService();

export async function employeesWithoutBonusHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const list = await compensationService.getEmployeesWithoutBonus();
    return okResponse(list);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('employeesWithoutBonus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/no-bonus',
  handler: employeesWithoutBonusHandler,
});
