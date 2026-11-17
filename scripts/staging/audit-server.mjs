// Loopback-only production artifact server with synthetic admin transport. Never a deployment server.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {adminRequest} from '../../.integration-build/server/admin.js';
import {createAdminFixture,fixtureEnv} from '../../tests/fixtures/admin-fetch.mjs';
export async function auditServer({port=4182}={}) {
 const fetcher=createAdminFixture(),root=resolve('dist/client');
 const server=createServer(async(req,res)=>{
  try{
   const url=new URL(req.url,'http://127.0.0.1:'+port);
   if(url.pathname.startsWith('/api/')){
    let result;
    if(url.pathname==='/api/admin'){
     const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>200000)throw Error();chunks.push(chunk);}
     result=await adminRequest(new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}),fixtureEnv,fetcher);
    }else if(url.pathname==='/api/content'){
     const data=await (await fetcher('https://admin-fixture.invalid/rest/v1/clinahir_site_content')).json();result=Response.json({content:data[0].published});
    }else result=Response.json({error:'Disabled in local audit'}, {status:503});
    res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
   }
   const requested=['/admin','/admin/'].includes(url.pathname)?'/admin.html':url.pathname;
   const path=resolve(root,'.'+decodeURIComponent(requested));if(path!==root&&!path.startsWith(root+sep))throw Error();
   let file=path,body;try{body=await readFile(file);}catch{file=resolve(root,'index.html');body=await readFile(file);}
   res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'})[extname(file)]??'application/octet-stream'});res.end(body);
  }catch{res.writeHead(503);res.end('Local audit unavailable');}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});return server;
}
