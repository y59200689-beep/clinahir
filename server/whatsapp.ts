/** Meta Cloud API adapter. Disabled until explicitly configured. */
export interface WhatsAppJob { external_id:string; phone:string; contact_name:string; attempts:number; token?:string }
export interface WhatsAppStore {
 whatsappDue(limit:number):Promise<string[]>;
 whatsappClaim(id:string):Promise<WhatsAppJob|null>;
 whatsappFinish(id:string,token:string,status:string,error:string|null,messageId:string|null,next:string|null):Promise<void>;
}
export interface WhatsAppConfig { WHATSAPP_ENABLED?:string; WHATSAPP_ACCESS_TOKEN?:string; WHATSAPP_PHONE_NUMBER_ID?:string; WHATSAPP_TEMPLATE_NAME?:string; WHATSAPP_TEMPLATE_LANGUAGE?:string; WHATSAPP_API_VERSION?:string; WHATSAPP_DEMO_URL?:string }
export async function processWhatsApp(store:WhatsAppStore,config:WhatsAppConfig,fetcher:typeof fetch=fetch,onlyId?:string):Promise<number> {
 if(config.WHATSAPP_ENABLED!=='true')return 0;
 const {WHATSAPP_ACCESS_TOKEN:secret,WHATSAPP_PHONE_NUMBER_ID:sender,WHATSAPP_TEMPLATE_NAME:template,WHATSAPP_TEMPLATE_LANGUAGE:language,WHATSAPP_API_VERSION:version,WHATSAPP_DEMO_URL:demo}=config;
 if(!secret || !/^\d+$/.test(sender ?? '') || !/^[a-z0-9_]+$/.test(template ?? '') || !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(language ?? '') || !/^v\d+\.\d+$/.test(version ?? '') || !demo || new URL(demo).protocol!=='https:')throw new Error('whatsapp_configuration_missing');
 const ids=onlyId?[onlyId]:await store.whatsappDue(1);let processed=0;
 for(const id of ids){const job=await store.whatsappClaim(id);if(!job?.token)continue;processed++;
  let status='blocked',reason:string|null=null,messageId:string|null=null,next:string|null=null;
  try {
   const response=await fetcher(`https://graph.facebook.com/${version}/${sender}/messages`,{method:'POST',headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to:job.phone.replace(/\D/g,''),type:'template',template:{name:template,language:{code:language},components:[{type:'body',parameters:[{type:'text',text:job.contact_name},{type:'text',text:demo}]}]}}),signal:AbortSignal.timeout(5000),redirect:'error'});
   if(response.ok){const data=await response.json() as {messages?:{id?:string}[]};messageId=data.messages?.[0]?.id ?? null;status=messageId?'accepted':'review';if(!messageId)reason='missing_provider_id';}
   else {reason=`http_${response.status}`;
    // Only retry explicit throttling; ambiguous failures require review to prevent duplicate messages.
    if(response.status===429){status=job.attempts>=5?'exhausted':'pending';if(status==='pending')next=new Date(Date.now()+Math.min(60_000*5**job.attempts,86400000)).toISOString();}
    else if(response.status>=500){status='review';}
   }
  } catch {status='review';reason='delivery_outcome_unknown';}
  await store.whatsappFinish(id,job.token,status,reason,messageId,next);
  console.info('clinahir_whatsapp',{externalId:id,status,reason});
 }
 return processed;
}
