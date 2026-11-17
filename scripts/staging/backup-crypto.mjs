import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
const magic=Buffer.from('CLINAHIR-BACKUP-V1\n');
function validateKey(key){if(!Buffer.isBuffer(key)||key.length!==32)throw Error('backup_key_must_be_32_bytes');}
export function encryptBackup(plaintext,key){
 validateKey(key);if(!Buffer.isBuffer(plaintext))throw Error('backup_buffer_required');
 const nonce=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,nonce,{authTagLength:16});cipher.setAAD(magic);
 const encrypted=Buffer.concat([cipher.update(plaintext),cipher.final()]);return Buffer.concat([magic,nonce,cipher.getAuthTag(),encrypted]);
}
export function decryptBackup(archive,key){
 validateKey(key);if(!Buffer.isBuffer(archive)||archive.length<magic.length+28||!archive.subarray(0,magic.length).equals(magic))throw Error('invalid_encrypted_backup');
 try{const decipher=createDecipheriv('aes-256-gcm',key,archive.subarray(magic.length,magic.length+12),{authTagLength:16});decipher.setAAD(magic);decipher.setAuthTag(archive.subarray(magic.length+12,magic.length+28));return Buffer.concat([decipher.update(archive.subarray(magic.length+28)),decipher.final()]);}
 catch{throw Error('backup_authentication_failed');}
}
