// Disposable local admin QA environment. Fictional data; no real account or provider calls.
import {createServer} from 'vite';
import {adminRequest} from '../.integration-build/server/admin.js';
import {createAdminFixture,fixtureEnv} from '../tests/fixtures/admin-fetch.mjs';
const fetcher=createAdminFixture();
const server=await createServer({server:{host:'127.0.0.1',port:4181,strictPort:true},plugins:[{name:'admin-qa-only',enforce:'pre',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 const url=new URL(req.url,`http://${req.headers.host}`);
 if(url.pathname==='/api/content'){const response=await fetcher('https://admin-fixture.invalid/rest/v1/clinahir_site_content');const d=await response.json();res.setHeader('Content-Type','application/json');res.end(JSON.stringify({content:d[0].published}));return;}
 if(url.pathname!=='/api/admin')return next();
 const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>200000){res.writeHead(413);res.end();return;}chunks.push(chunk);}
 const headers=new Headers();for(const [k,v]of Object.entries(req.headers))if(v)headers.set(k,Array.isArray(v)?v.join(','):v);
 const request=new Request(url,{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})});
 const result=await adminRequest(request,fixtureEnv,fetcher);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());
 });},transformIndexHtml(html){return html.replace('<body>','<body><div style="position:fixed;bottom:3px;left:8px;z-index:9999;font:10px sans-serif;color:#688060">ADMIN QA · Fictional data · No production connection</div>');}}]});
await server.listen();console.log('Isolated admin QA: http://127.0.0.1:4181/admin');
