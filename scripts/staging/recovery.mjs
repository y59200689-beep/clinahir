// Compare operator-generated, synthetic staging snapshots; equality alone is not proof of a restore.
export function compareRecovery(source,restored){
 const problems=[];
 for(const [name,entry]of [['source',source],['restore',restored]]){
  if(entry?.environment!=='staging'||entry?.syntheticOnly!==true||!entry?.projectRef||!entry?.productionRef||entry.projectRef===entry.productionRef)problems.push(name+'_identity_not_verified');
  if(!/^[a-f0-9]{64}$/.test(entry?.schemaSha256??'')||!Array.isArray(entry?.tables)||entry.tables.length===0)problems.push(name+'_manifest_invalid');
  const names=new Set();for(const table of entry?.tables??[]){if(!table.name?.startsWith('clinahir_')||names.has(table.name)||!Number.isSafeInteger(table.rows)||table.rows<0||!/^[a-f0-9]{64}$/.test(table.sha256??''))problems.push(name+'_table_manifest_invalid');names.add(table.name);}
 }
 if(source?.projectRef===restored?.projectRef)problems.push('restore_must_use_isolated_project');
 if(source?.schemaSha256!==restored?.schemaSha256)problems.push('schema_mismatch');
 const normalize=tables=>JSON.stringify([...(tables??[])].sort((a,b)=>String(a.name).localeCompare(String(b.name))));
 if(normalize(source?.tables)!==normalize(restored?.tables))problems.push('table_data_mismatch');
 return {consistent:problems.length===0,problems,backupVerified:false,limitation:'Requires independent evidence of backup creation, restore execution, migration/role checks and application smoke tests. This comparator alone cannot certify recovery.'};
}
