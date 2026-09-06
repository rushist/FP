import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { CompensationService } from '../../services/CompensationService';
import { okResponse, errorResponse } from '../../utils/httpResponse';

const compensationService = new CompensationService();

export async function bonusPercentageHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const list = await compensationService.getBonusPercentages();
    return okResponse(list);
  } catch (err) {
    return errorResponse(err);
  }
}

app.http('bonusPercentage', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'reports/bonus-percentage',
  handler: bonusPercentageHandler,
});
