import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CompensationService } from '../../services/CompensationService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const compensationService = new CompensationService();

export async function totalBonusHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const report = await compensationService.getTotalBonus();
    return okResponse(report);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('totalBonus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/total-bonus',
  handler: totalBonusHandler,
});
