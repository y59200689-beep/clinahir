import { loadEnv } from 'vite';
export function leadsDev() {
  return { name: 'clinahir-leads-api', configureServer(server) {
    const env = { ...loadEnv(server.config.mode, server.config.root, ''), ...process.env };
    server.middlewares.use(async (req, res, next) => {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (!['/api/leads', '/api/cron/leads', '/api/analytics'].includes(pathname)) return next();
      try {
        const chunks = []; let size = 0;
        for await (const chunk of req) { size += chunk.length; if (size > 16384) { res.writeHead(413); res.end(); return; } chunks.push(chunk); }
        const { SupabaseLeadStore } = await server.ssrLoadModule('/server/supabase.ts');
        const { leadRequest, retryRequest } = await server.ssrLoadModule('/server/http.ts');
        const { serverConfig } = await server.ssrLoadModule('/server/config.ts');
        const headers = new Headers();
        for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(',') : value);
        const request = new Request(`http://${req.headers.host}${req.url}`, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
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
