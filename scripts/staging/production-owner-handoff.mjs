// Private loopback owner setup using the already-tested Admin UI/API. Never logs tokens/passwords/MFA material.
import {createServer} from 'node:http';import {readFile,writeFile} from 'node:fs/promises';import {resolve,extname,sep} from 'node:path';import {randomBytes} from 'node:crypto';import {adminRequest} from '../../.integration-build/server/admin.js';
const env=JSON.parse(await readFile('output/production/runtime-configuration.json','utf8'));
if(env.projectRef!=='jsagrvxgydvhdoxibzny'||env.CLINAHIR_ADMIN_EMAIL!=='youssefmahir87@gmail.com'||!env.CLINAHIR_ADMIN_USER_ID)throw Error('approved_production_owner_required');
const ticket=randomBytes(32).toString('hex'),root=resolve('dist/client');let used=false;
const allowed=new Set(['activate','set-password','request-password-reset','login','session','mfa-state','mfa-enroll','mfa-verify','logout']);
const server=createServer(async(req,res)=>{try{
 const origin='http://127.0.0.1:'+server.address().port,url=new URL(req.url,origin);
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
 if(url.pathname==='/start'){
  if(used||url.searchParams.get('ticket')!==ticket){res.writeHead(403);res.end('Setup entry expired.');return;}
  used=true;
  const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY,'Content-Type':'application/json'};
  const generated=await fetch(env.SUPABASE_URL+'/auth/v1/admin/generate_link',{method:'POST',headers,body:JSON.stringify({type:'magiclink',email:env.CLINAHIR_ADMIN_EMAIL}),redirect:'error',signal:AbortSignal.timeout(15000)});if(!generated.ok)throw Error('setup_generation_failed');
  const data=await generated.json(),tokenHash=data.hashed_token??data.properties?.hashed_token;if(!tokenHash)throw Error('setup_hash_missing');
  const verified=await fetch(env.SUPABASE_URL+'/auth/v1/verify',{method:'POST',headers,body:JSON.stringify({type:'magiclink',token_hash:tokenHash}),redirect:'error',signal:AbortSignal.timeout(15000)});if(!verified.ok)throw Error('private_email_session_failed');
  const session=await verified.json();if(session.user?.id!==env.CLINAHIR_ADMIN_USER_ID||!session.access_token)throw Error('setup_identity_mismatch');
  res.writeHead(303,{Location:origin+'/admin#access_token='+encodeURIComponent(session.access_token)});res.end();return;
 }
 if(url.pathname==='/api/admin'){
  const action=url.searchParams.get('action')??'session';if(!allowed.has(action)){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Private setup only. After MFA setup, continue to the production admin.'}));return;}
  let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>200000)throw Error('request_too_large');chunks.push(c);}
  const response=await adminRequest(new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body:Buffer.concat(chunks)})}),env);
  const h=Object.fromEntries(response.headers);delete h['set-cookie'];res.writeHead(response.status,{...h,'Set-Cookie':response.headers.getSetCookie()});res.end(await response.text());return;
 }
 if(url.pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
 const path=resolve(root,'.'+(/^\/admin(?:\/|$)/.test(url.pathname)?'/admin.html':decodeURIComponent(url.pathname)));if(!path.startsWith(root+sep))throw Error('invalid_asset');
 const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'})[extname(path)]??'application/octet-stream'});res.end(body);
}catch{res.writeHead(503,{'Content-Type':'text/plain'});res.end('Private setup unavailable. Return to Codex; no password or token is needed in chat.');}});
await new Promise((ok,fail)=>{server.once('error',fail);server.listen(Number(process.env.CLINAHIR_OWNER_SETUP_PORT??0),'127.0.0.1',ok);});
const start='http://127.0.0.1:'+server.address().port+'/start?ticket='+ticket;
const html='<!doctype html><html><meta name="referrer" content="no-referrer"><title>Private Clinahir owner setup</title><main style="font:18px system-ui;max-width:620px;margin:12vh auto;padding:24px"><h1>Production owner setup</h1><p>Choose your own password, sign in as youssefmahir87@gmail.com, and enroll your authenticator. Keep all passwords, QR codes and MFA codes private. This setup page cannot read or edit business records.</p><a href="'+start+'">Start private password and MFA setup</a></main></html>';
await writeFile('output/production/owner-setup.html',html,{mode:0o600});
await writeFile('output/production/owner-setup-server.json',JSON.stringify({pid:process.pid,port:server.address().port,startedAt:new Date().toISOString(),ownerId:env.CLINAHIR_ADMIN_USER_ID})+'\n',{mode:0o600});
console.log('Private owner setup is ready in output/production/owner-setup.html; no credential or MFA material printed.');
