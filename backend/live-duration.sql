-- Run once after live-classroom.sql; safe to re-run. Existing room expiry is unchanged.
alter table public.live_rooms add column if not exists duration_minutes integer not null default 360;
create or replace function public.enforce_live_duration() returns trigger
language plpgsql security definer set search_path=public as $$
declare cfg jsonb; cap integer:=360; def integer:=360; allowed boolean:=true;
begin
 if TG_OP='UPDATE' then
  if new.expires_at is distinct from old.expires_at or new.duration_minutes is distinct from old.duration_minutes then
   raise exception 'مدة الجلسة القائمة ثابتة؛ أنشئ جلسة جديدة لتغيير المدة.';
  end if;
  return new;
 end if;
 select payload->'liveSession' into cfg from public.sites where slug='public';
 if (cfg->>'maxMinutes') ~ '^[0-9]{1,4}$' then cap:=greatest(15,least(1440,(cfg->>'maxMinutes')::integer));end if;
 if (cfg->>'defaultMinutes') ~ '^[0-9]{1,4}$' then def:=greatest(15,least(cap,(cfg->>'defaultMinutes')::integer));end if;
 allowed:=coalesce(cfg->>'allowTeacherDuration','true')='true';
 if new.duration_minutes<15 or new.duration_minutes>cap or new.duration_minutes%15<>0 or (not allowed and new.duration_minutes<>def) then
  raise exception 'مدة الجلسة خارج الحدود التي حددها المشرف.';
 end if;
 new.expires_at:=now()+make_interval(mins=>new.duration_minutes);
 return new;
end $$;
revoke all on function public.enforce_live_duration() from public;
drop trigger if exists live_duration_guard on public.live_rooms;
create trigger live_duration_guard before insert or update on public.live_rooms for each row execute function public.enforce_live_duration();
create or replace function public.create_live_room(duration_minutes integer,scene_payload jsonb)
returns setof public.live_rooms language plpgsql security invoker set search_path=public as $$
begin
 if auth.uid() is null or coalesce(public.current_madar_role(),'') not in ('teacher','admin') then raise exception 'يلزم حساب معلم أو مشرف.';end if;
 return query insert into public.live_rooms(owner_id,payload,duration_minutes) values(auth.uid(),$2,$1) returning *;
end $$;
revoke all on function public.create_live_room(integer,jsonb) from public,anon;
grant execute on function public.create_live_room(integer,jsonb) to authenticated;
