-- Enforce that organization-scoped child rows cannot point at parent rows
-- belonging to a different tenant, even if a UUID is known.

alter table public.pilots
  add constraint pilots_org_id_id_unique unique (organization_id, id);

alter table public.jobs
  add constraint jobs_org_id_id_unique unique (organization_id, id);

alter table public.jobs
  add constraint jobs_pilot_same_org_fk
  foreign key (organization_id, pilot_id)
  references public.pilots (organization_id, id)
  on delete set null;

alter table public.job_steps
  add constraint job_steps_job_same_org_fk
  foreign key (organization_id, job_id)
  references public.jobs (organization_id, id)
  on delete cascade;

alter table public.approvals
  add constraint approvals_job_same_org_fk
  foreign key (organization_id, job_id)
  references public.jobs (organization_id, id)
  on delete cascade;
