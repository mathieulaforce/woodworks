-- Initial schema: workspaces (tenants), projects with parts and drawings,
-- assets, contacts, loans and machine availability.
-- Every tenant-owned row carries workspace_id and is guarded by RLS.

create extension if not exists btree_gist;

-- Tenancy ------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.workspace_role as enum ('owner', 'member');

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role public.workspace_role not null default 'member',
  primary key (workspace_id, user_id)
);

-- security definer so policies on workspace_members can call it without recursing.
create function public.is_member(ws uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws and user_id = auth.uid()
  );
$$;

-- Projects and design --------------------------------------------------------

create type public.project_status as enum
  ('idea', 'designing', 'building', 'finishing', 'done', 'on_hold');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  status public.project_status not null default 'idea',
  description text,
  created_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  -- Stock on hand, in the unit below (pieces, m, m2, kg...).
  quantity numeric not null default 0,
  unit text not null default 'pcs',
  location text
);

create table public.parts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  project_id uuid not null references public.projects on delete cascade,
  name text not null,
  length_mm numeric not null check (length_mm > 0),
  width_mm numeric not null check (width_mm > 0),
  thickness_mm numeric not null check (thickness_mm > 0),
  quantity int not null default 1 check (quantity > 0),
  material_id uuid references public.materials on delete set null
);

-- A 3D drawing plus its ordered transformation steps
-- (see packages/geometry TransformStep for the JSON shape).
create table public.drawings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  project_id uuid not null references public.projects on delete cascade,
  name text not null,
  model jsonb not null default '{}'::jsonb,
  transform_steps jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Assets, contacts, lending --------------------------------------------------

create type public.asset_kind as enum ('machine', 'hand_tool', 'power_tool', 'jig');

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  kind public.asset_kind not null,
  name text not null,
  location text
);

-- A person you lend to or borrow from: a registered user, or just a name you
-- typed in for someone who doesn't use the app.
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  name text not null,
  user_id uuid references auth.users on delete set null
);

create type public.loan_direction as enum ('lent_out', 'borrowed');
create type public.loan_status as enum ('requested', 'active', 'returned', 'cancelled');

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  -- Set when lending out your own asset; borrowed items may only have a name.
  asset_id uuid references public.assets on delete set null,
  asset_name text not null,
  contact_id uuid not null references public.contacts on delete restrict,
  direction public.loan_direction not null,
  status public.loan_status not null default 'requested',
  starts_on date not null,
  due_on date,
  check (due_on is null or due_on >= starts_on)
);

-- Machine availability ------------------------------------------------------

-- Recurring windows, e.g. the school CNC on Tuesdays 18:00 to 21:00.
create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  asset_id uuid not null references public.assets on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null check (end_time > start_time),
  location text
);

-- Concrete reservations; the exclusion constraint prevents double booking.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces on delete cascade,
  asset_id uuid not null references public.assets on delete cascade,
  project_id uuid references public.projects on delete set null,
  during tstzrange not null,
  exclude using gist (asset_id with =, during with &&)
);

-- Row Level Security --------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create policy "members read their workspaces" on public.workspaces
  for select using (public.is_member(id));

create policy "members see co-members" on public.workspace_members
  for select using (public.is_member(workspace_id));

-- Same rule for every tenant table: members of the workspace can do everything.
do $$
declare t text;
begin
  foreach t in array array[
    'projects', 'materials', 'parts', 'drawings', 'assets',
    'contacts', 'loans', 'availability_windows', 'bookings'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "workspace members" on public.%I for all
         using (public.is_member(workspace_id))
         with check (public.is_member(workspace_id))', t);
    execute format('create index on public.%I (workspace_id)', t);
  end loop;
end $$;

-- Creating a workspace makes the caller its owner.
create function public.create_workspace(ws_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare ws uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  insert into public.workspaces (name) values (ws_name) returning id into ws;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (ws, auth.uid(), 'owner');
  return ws;
end;
$$;
