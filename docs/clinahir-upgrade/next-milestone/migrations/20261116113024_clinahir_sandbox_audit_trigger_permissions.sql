-- Sandbox hardening: provider defaults may grant EXECUTE directly to browser roles.
-- Trigger dispatch retains its owner-authorized behavior; this removes direct RPC access only.
revoke all on function public.financial_audit_change() from public,anon,authenticated;
