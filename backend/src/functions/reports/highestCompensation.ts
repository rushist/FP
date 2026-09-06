import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CompensationService } from '../../services/CompensationService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const compensationService = new CompensationService();

export async function highestCompensationHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const report = await compensationService.getHighestCompensationComparison();
    return okResponse(report);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('highestCompensation', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/highest-compensation',
  handler: highestCompensationHandler,
});
