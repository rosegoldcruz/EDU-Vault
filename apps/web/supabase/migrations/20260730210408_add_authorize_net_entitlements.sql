alter table public.iv_member_entitlements
  add column if not exists payment_provider text null,
  add column if not exists provider_checkout_session_id text null,
  add column if not exists provider_payment_id text null;

alter table public.iv_member_entitlements
  drop constraint if exists iv_member_entitlements_source_check;

alter table public.iv_member_entitlements
  add constraint iv_member_entitlements_source_check
  check (source in ('stripe', 'authorize_net', 'invite', 'grandfathered', 'admin'));

create unique index if not exists iv_member_entitlements_provider_checkout_session_unique
  on public.iv_member_entitlements (provider_checkout_session_id)
  where provider_checkout_session_id is not null;

create index if not exists idx_iv_member_entitlements_payment_provider
  on public.iv_member_entitlements (payment_provider);
