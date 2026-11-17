import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {decryptBackup} from './backup-crypto.mjs';import {retentionPlan} from './backup-retention.mjs';
const dir='output/production/offsite',args=process.argv.slice(2),value=n=>args[args.indexOf(n)+1];
if(!args.includes('--file-id')||!args.includes('--download'))throw Error('explicit_uploaded_id_and_independent_download_required');
const fileId=value('--file-id');if(!/^[-_a-zA-Z0-9]{10,}$/.test(fileId))throw Error('invalid_drive_id');
const r=JSON.parse(await readFile(dir+'/latest.json','utf8'));if(r.projectRef!=='jsagrvxgydvhdoxibzny'||r.status!=='encrypted_export_verified')throw Error('fresh_verified_export_required');
const hash=x=>createHash('sha256').update(x).digest('hex'),cipher=await readFile(value('--download'));
if(hash(cipher)!==r.encryptedSha256)throw Error('download_checksum_mismatch');const key=Buffer.from((await readFile(r.keyPath,'utf8')).trim(),'hex'),plain=decryptBackup(cipher,key);key.fill(0);if(hash(plain)!==r.plaintextSha256)throw Error('decrypted_checksum_mismatch');plain.fill(0);
let catalog;try{catalog=JSON.parse(await readFile(dir+'/catalog.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;catalog=[];}
if(catalog.some(x=>x.id===r.id||x.fileId===fileId))throw Error('duplicate_backup_registration');
catalog.push({id:r.id,createdAt:r.checkedAt,projectRef:r.projectRef,folderId:'16PUVR7LKSZl54dAEOAMyR2FePNAORbIO',fileId,fileName:r.archivePath.split('/').pop(),verified:true,trashed:false,encryptedSha256:r.encryptedSha256});
const plan=retentionPlan(catalog,new Date(),{project:'jsagrvxgydvhdoxibzny',folder:'16PUVR7LKSZl54dAEOAMyR2FePNAORbIO',filePattern:/^clinahir-production-.*\.sql\.aesgcm$/});
await writeFile(dir+'/catalog.json',JSON.stringify(catalog,null,2)+'\n',{mode:0o600});await writeFile(dir+'/retention-plan.json',JSON.stringify(plan,null,2)+'\n',{mode:0o600});r.offsite={fileId,independentReadbackDecryption:true,readerMetadataVerification:'required through Drive connector',retentionPlanPath:dir+'/retention-plan.json'};await writeFile(dir+'/runs/'+r.id+'.json',JSON.stringify(r,null,2)+'\n',{mode:0o600});console.log(JSON.stringify({status:'independent_readback_verified',fileId,trashCandidates:plan.trashCandidates.length,permanentDeletionAllowed:false}));
