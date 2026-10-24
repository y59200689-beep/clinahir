import { adminRequest } from '../server/admin.js';
export const GET = (request: Request) => adminRequest(request, process.env);
export const POST = GET;
