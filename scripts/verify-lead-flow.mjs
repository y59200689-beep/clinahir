// Disposable local verification harness; never used by production endpoints.
import { createServer } from 'vite';
import { leadRequest } from '../.integration-build/server/http.js';
import { MemoryStore } from '../tests/fixtures/memory-store.mjs';
const store = new MemoryStore();
const sent = [];
const config = { DAILY_COMMAND_URL: 'https://command.test.invalid', CLINAHIR_INTEGRATION_SECRET: 'local-test-only-secret' };
const server = await createServer({ server: { host: '127.0.0.1', port: 4180, strictPort: true }, plugins: [{ name: 'test-leads-harness', enforce: 'pre', configureServer(server) {
 server.middlewares.use(async (req,res,next)=> {
  if (req.url?.startsWith('/__test/observations')) { res.setHeader('Content-Type','application/json');res.end(JSON.stringify({sent, records:[...store.records.values()]}));return; }
  if (!req.url?.startsWith('/api/leads')) return next();
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const request=new Request(`http://${req.headers.host}${req.url}`,{method:req.method,headers:{'Content-Type':req.headers['content-type']??'',Origin:req.headers.origin??''},body:Buffer.concat(chunks)});
  const response=await leadRequest(request,store,config,async(url,init)=> {sent.push({url:String(url),authorized:init.headers.Authorization===`Bearer ${config.CLINAHIR_INTEGRATION_SECRET}`,payload:JSON.parse(init.body)});return Response.json({ok:true});});
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(await response.text());
 });
} }] });
await server.listen();console.log('Local lead verification fixture: http://127.0.0.1:4180');
