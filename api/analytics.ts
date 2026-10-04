import { analyticsRequest } from '../server/analytics.js';
export function POST(request: Request): Promise<Response> { return analyticsRequest(request,process.env); }
