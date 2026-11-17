import { observeResponse } from '../server/observability.js';
import { adminRequest } from '../server/admin.js';
export const GET = async (request: Request) => observeResponse('admin', await adminRequest(request, process.env));
export const POST = GET;
