-- Run once in a new Supabase project. Role changes are server-enforced.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'learner' check (role in ('learner','teacher','admin'))
);
create function public.current_madar_role() returns text
language sql stable security definer set search_path = public
as $$ select role from public.profiles where user_id=auth.uid() $$;
revoke all on function public.current_madar_role() from public;
grant execute on function public.current_madar_role() to authenticated;
alter table public.profiles enable row level security;
revoke all on public.profiles from anon,authenticated;
grant select,insert,update,delete on public.profiles to authenticated;
create policy profile_read on public.profiles for select to authenticated
using (user_id=auth.uid() or public.current_madar_role()='admin');
create policy profile_admin on public.profiles for all to authenticated
using (public.current_madar_role()='admin') with check (public.current_madar_role()='admin');
create table public.sites (
  slug text primary key check (slug in ('public','education')),
  payload jsonb not null default '{}'::jsonb
);
alter table public.sites enable row level security;
revoke all on public.sites from anon,authenticated;
grant select on public.sites to anon;
grant select,insert,update,delete on public.sites to authenticated;
create policy site_read on public.sites for select to anon,authenticated using (true);
create policy site_admin on public.sites for all to authenticated
using (public.current_madar_role()='admin') with check (public.current_madar_role()='admin');
create table public.course_drafts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.course_drafts enable row level security;
revoke all on public.course_drafts from anon,authenticated;
grant select,insert,update,delete on public.course_drafts to authenticated;
create policy draft_owner on public.course_drafts for all to authenticated
using ((owner_id=auth.uid() and public.current_madar_role()='teacher') or public.current_madar_role()='admin')
with check ((owner_id=auth.uid() and public.current_madar_role()='teacher') or public.current_madar_role()='admin');
create table public.learning_reports (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.learning_reports enable row level security;
revoke all on public.learning_reports from anon,authenticated;
grant select,insert,update,delete on public.learning_reports to authenticated;
create policy report_owner on public.learning_reports for all to authenticated
using (owner_id=auth.uid() or public.current_madar_role()='admin')
with check (owner_id=auth.uid() or public.current_madar_role()='admin');
-- Bootstrap your first admin only through SQL Editor after creating that Auth user:
-- insert into public.profiles(user_id,role) values ('YOUR_AUTH_USER_UUID','admin');
-- A teacher cannot modify profiles. Invite users through Supabase Auth, then assign
-- their profile role from an administrator session or SQL Editor.
