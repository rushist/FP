import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { db } from '../database/connection';
import { okResponse } from '../utils/httpResponse';

export async function healthHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const isHealthy = await db.isHealthy();
  return okResponse({
    status: isHealthy ? 'ok' : 'degraded',
  });
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: healthHandler,
});
