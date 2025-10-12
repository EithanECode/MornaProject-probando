-- Required for gen_random_uuid
create extension if not exists pgcrypto;

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  audience_type text not null check (audience_type in ('role','user')),
  audience_value text not null, -- role name or user id
  role text, -- optional denormalized role
  title text not null,
  description text,
  href text,
  severity text not null default 'info' check (severity in ('info','warn','critical')),
  unread boolean not null default true,
  created_at timestamptz not null default now(),
  user_id uuid, -- when audience_type = 'user'
  order_id text,
  payment_id text
);

-- Enable RLS (adjust policies to your JWT claims)
alter table public.notifications enable row level security;

-- Minimal open read policy (adjust in prod)
create policy notifications_read_all
  on public.notifications
  for select
  using (true);

-- Allow inserts for service role (or authenticated if you prefer)
create policy notifications_insert_authenticated
  on public.notifications
  for insert
  with check (auth.role() = 'service_role' or auth.role() = 'authenticated');

-- Allow updates by owner when audience_type='user' and matches auth.uid()
create policy notifications_update_owner
  on public.notifications
  for update
  using (
    audience_type = 'user' and user_id is not null and auth.uid() = user_id
  )
  with check (
    audience_type = 'user' and user_id is not null and auth.uid() = user_id
  );

-- Optional: allow updates by any authenticated (for role-based bulk mark-as-read). You may tighten this.
create policy notifications_update_authenticated
  on public.notifications
  for update
  to authenticated
  using (true)
  with check (true);

-- Per-user read tracking
create table if not exists public.notification_reads (
  notification_id uuid references public.notifications(id) on delete cascade,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);

alter table public.notification_reads enable row level security;

-- A user can see their own read markers
create policy notification_reads_select_own
  on public.notification_reads
  for select
  using (auth.uid() = user_id);

-- A user can insert their own read marker
create policy notification_reads_insert_own
  on public.notification_reads
  for insert
  with check (auth.uid() = user_id);

-- A user can delete their own read marker (optional, to marcar como no leído)
create policy notification_reads_delete_own
  on public.notification_reads
  for delete
  using (auth.uid() = user_id);
