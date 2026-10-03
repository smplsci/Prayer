-- Run once AFTER schema.sql. Live scene links grant viewing, never control.
create table public.live_rooms (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id),
 join_token uuid not null unique default gen_random_uuid(),
 payload jsonb not null default '{}'::jsonb check (octet_length(payload::text)<40000),
 active boolean not null default true,
 updated_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '6 hours'
);
alter table public.live_rooms enable row level security;
revoke all on public.live_rooms from anon,authenticated;
grant select,insert,update on public.live_rooms to authenticated;
create policy live_room_owner on public.live_rooms for all to authenticated
using (owner_id=auth.uid() and public.current_madar_role() in ('admin','teacher'))
with check (owner_id=auth.uid() and public.current_madar_role() in ('admin','teacher'));
create function public.read_live_room(view_token uuid)
returns table(payload jsonb,updated_at timestamptz,active boolean)
language sql stable security definer set search_path=public
as $$ select r.payload,r.updated_at,r.active from public.live_rooms r
 where r.join_token=view_token and r.expires_at>now() $$;
revoke all on function public.read_live_room(uuid) from public;
grant execute on function public.read_live_room(uuid) to anon,authenticated;
