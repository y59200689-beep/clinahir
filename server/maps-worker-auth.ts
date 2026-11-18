import { createPublicKey, verify } from 'node:crypto';
const issuer='https://token.actions.githubusercontent.com';
const audience='https://clinahir.tech/api/maps-worker';
export async function validMapsWorker(token:string,fetcher:typeof fetch=fetch):Promise<boolean>{
 try{
  if(token.length>16000||!/^[-\w]+\.[-\w]+\.[-\w]+$/.test(token))return false;
  const [h,p,s]=token.split('.');const header=JSON.parse(Buffer.from(h,'base64url').toString());
  if(header.alg!=='RS256'||typeof header.kid!=='string'||header.kid.length>200)return false;
  const response=await fetcher(issuer+'/.well-known/jwks',{redirect:'error',signal:AbortSignal.timeout(5000)});if(!response.ok)return false;
  const keys=await response.json() as {keys:{kty:string;n:string;e:string;kid:string;alg:string;use:string}[]};
  const key=keys.keys.find(k=>k.kid===header.kid&&k.kty==='RSA'&&k.alg==='RS256'&&k.use==='sig');if(!key)return false;
  if(!verify('RSA-SHA256',Buffer.from(h+'.'+p),createPublicKey({key,format:'jwk'}),Buffer.from(s,'base64url')))return false;
  const c=JSON.parse(Buffer.from(p,'base64url').toString());const now=Math.floor(Date.now()/1000);
  const subjects=['repo:y59200689-beep/clinahir:ref:refs/heads/main','repo:y59200689-beep@297662398/clinahir@1402964658:ref:refs/heads/main'];
  return c.iss===issuer&&c.aud===audience&&c.repository==='y59200689-beep/clinahir'&&c.repository_id==='1402964658'&&c.repository_owner_id==='297662398'&&c.ref==='refs/heads/main'&&subjects.includes(c.sub)&&['schedule','workflow_dispatch'].includes(c.event_name)&&c.workflow_ref==='y59200689-beep/clinahir/.github/workflows/maps-worker.yml@refs/heads/main'&&Number.isFinite(c.exp)&&c.exp>now&&c.exp<=now+900&&Number.isFinite(c.iat)&&c.iat<=now+30&&c.iat>=now-900&&(!c.nbf||c.nbf<=now+30);
 }catch{return false;}
}
