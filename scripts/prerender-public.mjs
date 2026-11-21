import {readFile,writeFile,readdir} from 'node:fs/promises';import {renderPublicShell,renderAdminSessionShell} from '../output/prerender/prerender.js';
const path='dist/client/index.html',html=await readFile(path,'utf8'),markup=renderPublicShell();if(!markup.includes('data-public-root')||!markup.includes('rendez-vous'))throw Error('public_prerender_missing');
const googleTag = `<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-T56GNJ27"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>`;

function addGoogleTag(pageHtml) {
  if (!pageHtml.includes('<head>')) throw Error('public_page_head_not_found');
  return pageHtml.replace('<head>', '<head>\n' + googleTag + '\n');
}

const updated=html.replace(/<div id="root">[\s\S]*?<\/div>/,()=>'<div id="root" data-prerendered="public">'+markup+'</div>');
if(updated===html)throw Error('public_prerender_root_not_found');await writeFile(path,addGoogleTag(updated));console.log('Prerendered public French hero; private routes remain client authenticated.');

const css=(await readdir('dist/client/assets')).filter(p=>/^AdminApp-.*\.css$/.test(p));if(css.length!==1)throw Error('admin_styles_required');
const adminHtml=html.replace(/<div id="root">[\s\S]*?<\/div>/,()=>'<div id="root" data-prerendered="admin">'+renderAdminSessionShell()+'</div>').replace('</head>','<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/assets/'+css[0]+'"></head>').replace('<html lang="fr">','<html lang="en">');
await writeFile('dist/client/admin.html',adminHtml);console.log('Prerendered admin session check; private business data requires verified server authorization.');

for (const section of ['examens', 'guide']) {
  const directory = 'dist/client/' + section;
  const pages = await readdir(directory, { recursive: true });
  for (const page of pages.filter(name => name.endsWith('/index.html'))) {
    const pagePath = directory + '/' + page;
    await writeFile(pagePath, addGoogleTag(await readFile(pagePath, 'utf8')));
  }
}
