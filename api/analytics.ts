import { environmentFailure } from '../server/environment.js';
import { analyticsRequest } from '../server/analytics.js';
export function POST(request: Request): Promise<Response> { return Promise.resolve(environmentFailure(process.env, request) ?? analyticsRequest(request,process.env)); }
