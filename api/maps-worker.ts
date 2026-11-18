import { mapsWorkerRequest } from '../server/maps.js';
export const POST=(request:Request)=>mapsWorkerRequest(request,process.env);
