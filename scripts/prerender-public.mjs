import {readFile,writeFile,readdir} from 'node:fs/promises';import {renderPublicShell,renderAdminSessionShell} from '../output/prerender/prerender.js';
const path='dist/client/index.html',html=await readFile(path,'utf8'),markup=renderPublicShell();if(!markup.includes('data-public-root')||!markup.includes('rendez-vous'))throw Error('public_prerender_missing');
const updated=html.replace(/<div id="root">[\s\S]*?<\/div>/,()=>'<div id="root" data-prerendered="public">'+markup+'</div>');
if(updated===html)throw Error('public_prerender_root_not_found');await writeFile(path,updated);console.log('Prerendered public French hero; private routes remain client authenticated.');

const css=(await readdir('dist/client/assets')).filter(p=>/^AdminApp-.*\.css$/.test(p));if(css.length!==1)throw Error('admin_styles_required');
const adminHtml=html.replace(/<div id="root">[\s\S]*?<\/div>/,()=>'<div id="root" data-prerendered="admin">'+renderAdminSessionShell()+'</div>').replace('</head>','<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/assets/'+css[0]+'"></head>').replace('<html lang="fr">','<html lang="en">');
await writeFile('dist/client/admin.html',adminHtml);console.log('Prerendered admin session check; private business data requires verified server authorization.');
