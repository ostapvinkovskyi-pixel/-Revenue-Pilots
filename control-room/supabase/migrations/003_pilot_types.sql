-- Keep persistence aligned with the normalized PilotType contract.

alter table public.pilots
  drop constraint if exists pilots_pilot_type_check;

alter table public.pilots
  add constraint pilots_pilot_type_check check (pilot_type in (
    'dispatcher',
    'intake',
    'communication',
    'meeting',
    'payment',
    'builder',
    'systems',
    'watchdog',
    'growth',
    'support',
    'custom'
  ));
