-- Revenue Pilots Control Room — core schema
-- Single-tenant deployment model: each client owns its project/data plane.
-- This schema intentionally stores connection status/metadata only, never credentials.

create schema if not exists private;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table public.pilots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pilot_type text not null check (pilot_type in ('builder', 'growth', 'support')),
  status text not null default 'active' check (status in ('active', 'paused', 'disabled')),
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  pilot_id uuid references public.pilots(id) on delete set null,
  external_job_id text,
  title text not null,
  status text not null check (status in (
    'received', 'requirements_complete', 'queued', 'build_started', 'code_complete',
    'validation_passed', 'preview_ready', 'qa_passed', 'owner_approved',
    'production_live', 'blocked', 'failed', 'cancelled'
  )),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_job_id)
);

create table public.job_steps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Events are the immutable operational history. Authenticated clients may append/read,
-- but there is intentionally no UPDATE or DELETE policy.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type text not null,
  subject_type text not null,
  subject_id text not null,
  payload jsonb not null default '{}'::jsonb,
  source text,
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  action text not null,
  repository text not null,
  pull_request_number bigint not null check (pull_request_number > 0),
  commit_sha text not null check (length(commit_sha) >= 7),
  preview_url text not null,
  requested_at timestamptz not null default now(),
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, job_id, repository, pull_request_number, commit_sha, action)
);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error', 'revoked')),
  account_label text not null,
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_metadata_no_sensitive_top_level_keys check (
    not (metadata ?| array[
      'token', 'access_token', 'refresh_token', 'password', 'api_key', 'secret', 'client_secret'
    ])
  )
);

create table public.support_grants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  granted_to_user_id uuid not null references auth.users(id) on delete cascade,
  granted_by_user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  scopes text[] not null check (cardinality(scopes) > 0),
  reason text,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_grant_expiry_after_creation check (expires_at > created_at)
);

create index memberships_user_status_idx on public.memberships (user_id, status);
create index memberships_org_role_idx on public.memberships (organization_id, role, status);
create index pilots_org_status_idx on public.pilots (organization_id, status);
create index jobs_org_status_updated_idx on public.jobs (organization_id, status, updated_at desc);
create index job_steps_job_created_idx on public.job_steps (job_id, created_at);
create index events_org_created_idx on public.events (organization_id, created_at desc);
create index events_subject_idx on public.events (organization_id, subject_type, subject_id, created_at desc);
create index approvals_org_status_idx on public.approvals (organization_id, status, requested_at desc);
create index approvals_job_sha_idx on public.approvals (job_id, commit_sha);
create index connections_org_status_idx on public.connections (organization_id, status);
create index support_grants_org_status_expiry_idx on public.support_grants (organization_id, status, expires_at);

create trigger organizations_set_updated_at before update on public.organizations
for each row execute function public.set_updated_at();
create trigger memberships_set_updated_at before update on public.memberships
for each row execute function public.set_updated_at();
create trigger pilots_set_updated_at before update on public.pilots
for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs
for each row execute function public.set_updated_at();
create trigger job_steps_set_updated_at before update on public.job_steps
for each row execute function public.set_updated_at();
create trigger approvals_set_updated_at before update on public.approvals
for each row execute function public.set_updated_at();
create trigger connections_set_updated_at before update on public.connections
for each row execute function public.set_updated_at();
create trigger support_grants_set_updated_at before update on public.support_grants
for each row execute function public.set_updated_at();

-- SECURITY DEFINER helpers prevent memberships-policy recursion while keeping the
-- decision membership-based. The private schema is not intended for API exposure.
create or replace function private.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = target_org_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

create or replace function private.is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.organization_id = target_org_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
      and m.role in ('owner', 'admin')
  );
$$;

revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.is_org_admin(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.is_org_admin(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.pilots enable row level security;
alter table public.jobs enable row level security;
alter table public.job_steps enable row level security;
alter table public.events enable row level security;
alter table public.approvals enable row level security;
alter table public.connections enable row level security;
alter table public.support_grants enable row level security;

create policy organizations_select_member on public.organizations
for select to authenticated using (private.is_org_member(id));
create policy organizations_update_admin on public.organizations
for update to authenticated using (private.is_org_admin(id)) with check (private.is_org_admin(id));

create policy memberships_select_member on public.memberships
for select to authenticated using (private.is_org_member(organization_id));
create policy memberships_insert_admin on public.memberships
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy memberships_update_admin on public.memberships
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy memberships_delete_admin on public.memberships
for delete to authenticated using (private.is_org_admin(organization_id));

create policy pilots_select_member on public.pilots
for select to authenticated using (private.is_org_member(organization_id));
create policy pilots_insert_admin on public.pilots
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy pilots_update_admin on public.pilots
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy pilots_delete_admin on public.pilots
for delete to authenticated using (private.is_org_admin(organization_id));

create policy jobs_select_member on public.jobs
for select to authenticated using (private.is_org_member(organization_id));
create policy jobs_insert_admin on public.jobs
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy jobs_update_admin on public.jobs
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy jobs_delete_admin on public.jobs
for delete to authenticated using (private.is_org_admin(organization_id));

create policy job_steps_select_member on public.job_steps
for select to authenticated using (private.is_org_member(organization_id));
create policy job_steps_insert_admin on public.job_steps
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy job_steps_update_admin on public.job_steps
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy job_steps_delete_admin on public.job_steps
for delete to authenticated using (private.is_org_admin(organization_id));

create policy events_select_member on public.events
for select to authenticated using (private.is_org_member(organization_id));
create policy events_insert_member on public.events
for insert to authenticated with check (private.is_org_member(organization_id));
-- Deliberately no UPDATE or DELETE policy for public.events.
revoke update, delete on public.events from authenticated;

create policy approvals_select_member on public.approvals
for select to authenticated using (private.is_org_member(organization_id));
create policy approvals_insert_admin on public.approvals
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy approvals_update_admin on public.approvals
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy approvals_delete_admin on public.approvals
for delete to authenticated using (private.is_org_admin(organization_id));

create policy connections_select_member on public.connections
for select to authenticated using (private.is_org_member(organization_id));
create policy connections_insert_admin on public.connections
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy connections_update_admin on public.connections
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy connections_delete_admin on public.connections
for delete to authenticated using (private.is_org_admin(organization_id));

create policy support_grants_select_member on public.support_grants
for select to authenticated using (private.is_org_member(organization_id));
create policy support_grants_insert_admin on public.support_grants
for insert to authenticated with check (private.is_org_admin(organization_id));
create policy support_grants_update_admin on public.support_grants
for update to authenticated using (private.is_org_admin(organization_id)) with check (private.is_org_admin(organization_id));
create policy support_grants_delete_admin on public.support_grants
for delete to authenticated using (private.is_org_admin(organization_id));

-- Organization/bootstrap creation is intentionally not granted to ordinary browser
-- sessions here. Provisioning must happen through a trusted server/admin flow so a
-- first owner membership cannot be self-forged through an RLS bootstrap loophole.
