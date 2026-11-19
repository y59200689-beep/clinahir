begin;

create table public.clinahir_lead_contacts (
  id uuid primary key,
  lead_id text not null references public.clinahir_leads(external_id) on delete cascade,
  actor uuid not null,
  channel text not null check (channel in ('phone', 'whatsapp', 'email', 'other')),
  outcome text not null check (outcome in ('reached', 'no_reply', 'follow_up_requested', 'declined')),
  note text not null default '' check (length(note) <= 1500),
  created_at timestamptz not null default now()
);

create index clinahir_lead_contacts_timeline_idx
  on public.clinahir_lead_contacts (lead_id, created_at desc, id desc);

alter table public.clinahir_lead_contacts enable row level security;
revoke all on public.clinahir_lead_contacts from public, anon, authenticated;
grant select, insert on public.clinahir_lead_contacts to service_role;

create function public.clinahir_admin_log_contact(
  p_id uuid, p_lead_id text, p_actor uuid, p_channel text, p_outcome text, p_note text
)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.clinahir_lead_contacts (id, lead_id, actor, channel, outcome, note)
  values (p_id, p_lead_id, p_actor, p_channel, p_outcome, p_note)
  on conflict (id) do nothing;
  return true;
end;
$$;

revoke all on function public.clinahir_admin_log_contact(uuid,text,uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.clinahir_admin_log_contact(uuid,text,uuid,text,text,text) to service_role;

notify pgrst, 'reload schema';
commit;
