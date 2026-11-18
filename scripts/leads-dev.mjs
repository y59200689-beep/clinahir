import { mapsDevRequest } from './maps-dev.mjs';
import { loadEnv } from 'vite';
export function leadsDev() {
  return { name: 'clinahir-leads-api', configureServer(server) {
    const env = { ...loadEnv(server.config.mode, server.config.root, ''), ...process.env };
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (!['/api/leads', '/api/cron/leads', '/api/analytics', '/api/admin', '/api/content'].includes(pathname)) return next();
      try {
        const { environmentFailure } = await server.ssrLoadModule('/server/environment.ts');
        const failure = environmentFailure(env);
        if (failure) { res.writeHead(failure.status, Object.fromEntries(failure.headers)); res.end(await failure.text()); return; }
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > (pathname === '/api/admin' ? 200000 : 16384)) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
        const { SupabaseLeadStore } = await server.ssrLoadModule('/server/supabase.ts');
        const { leadRequest, retryRequest } = await server.ssrLoadModule('/server/http.ts');
        const { serverConfig } = await server.ssrLoadModule('/server/config.ts');
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(',') : value);
        const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
        if (pathname === '/api/admin') {
          const {adminRequest}=await server.ssrLoadModule('/server/admin.ts');
          const action = new URL(request.url).searchParams.get('action');
          let result;
          if (['maps-start', 'maps-status', 'maps-export', 'maps-stop', 'maps-import', 'maps-history'].includes(action)) {
            const sessionUrl = new URL(request.url); sessionUrl.search = '?action=session';
            const session = await adminRequest(new Request(sessionUrl, { headers: request.headers }), env);
            result = session.ok ? await mapsDevRequest(request, { matchProspects: rows =>
              new SupabaseLeadStore(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '')
                .adminRpc('clinahir_maps_matches', { p_rows: rows.map(({title,city}) => ({ title: title.slice(0,200), city: city.slice(0,120) })) }),
            importProspects: async csv => {
              const importUrl = new URL(request.url); importUrl.search = '?action=prospects-import';
              const importHeaders = new Headers(request.headers); importHeaders.set('content-type', 'application/json'); importHeaders.delete('content-length');
              return adminRequest(new Request(importUrl, { method: 'POST', headers: importHeaders, body: JSON.stringify({ csv, sourceUseConfirmed: true }) }), env);
            } }) : session;
          } else result = await adminRequest(request,env);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
        }
        if (pathname === '/api/content') {
          try {const rows=await new SupabaseLeadStore(env.SUPABASE_URL||'',env.SUPABASE_SERVICE_ROLE_KEY||'').publishedContent();res.setHeader('Content-Type','application/json');res.end(JSON.stringify({content:rows[0]?.published??null}));}catch{res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({content:null}));}return;
        }
        if (pathname === '/api/analytics') {
          const { analyticsRequest } = await server.ssrLoadModule('/server/analytics.ts');
          const result = await analyticsRequest(request,env); res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
        }
        const response = await (pathname === '/api/leads' ? leadRequest : retryRequest)(request, new SupabaseLeadStore(env.SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || ''), serverConfig(env));
        res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text());
      } catch { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Your request could not be saved. Please try again.' })); }
    });
  } };
}
