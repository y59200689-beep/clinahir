// Synthetic loopback receiver. Test controls are in-process, never public HTTP endpoints.
import {createServer} from 'node:http';
import {createHash,timingSafeEqual} from 'node:crypto';
export async function createCrmReceiver(secret) {
 if(typeof secret!=='string'||secret.length<16)throw Error('receiver_secret_required');
 let mode='healthy',attempts=0;const receipts=new Map();
 const server=createServer(async(req,res)=>{
  const answer=(status)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({ok:status<300}));};
  const expected=Buffer.from(`Bearer ${secret}`),supplied=Buffer.from(req.headers.authorization??'');
  if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected))return answer(401);
  if(req.method==='GET'&&/^\/__verification\/receipts\/cli_[0-9a-f-]{36}$/i.test(req.url??'')){const externalId=req.url.split('/').pop();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({externalId,receiptCount:receipts.has(externalId)?1:0}));return;}
  if(req.url!=='/api/integrations/clinahir/leads'||req.method!=='POST')return answer(404);
  try{
   const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>16384)return answer(413);chunks.push(chunk);}
   const raw=Buffer.concat(chunks),body=JSON.parse(raw);
   if(!/^cli_[0-9a-f-]{36}$/i.test(body.externalId??'')||!String(body.companyName??'').startsWith('Synthetic '))return answer(400);
   attempts++;
   if(mode==='outage')return answer(503);
   if(mode==='timeout')return; // Client's bounded timeout must fire; closeAllConnections handles teardown.
   const fingerprint=createHash('sha256').update(raw).digest('hex');
   if(receipts.has(body.externalId)&&receipts.get(body.externalId)!==fingerprint)return answer(409);
   receipts.set(body.externalId,fingerprint);
   return answer(mode==='accepted-but-unacknowledged'?503:201);
  }catch{return answer(400);}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return {origin:`http://127.0.0.1:${server.address().port}`,setMode(value){if(!['healthy','outage','timeout','accepted-but-unacknowledged'].includes(value))throw Error('invalid_receiver_mode');mode=value;},observations(){return{attempts,uniqueReceipts:receipts.size};},async close(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
