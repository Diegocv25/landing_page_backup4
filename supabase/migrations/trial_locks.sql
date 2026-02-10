create table if not exists public.trial_locks (
  id bigserial primary key,
  lock_type text not null, -- 'phone' | 'address' | 'name' | 'fingerprint' | 'ip'
  lock_hash text not null, -- sha256 hex/base64 do valor normalizado
  created_at timestamptz not null default now()
);

create unique index if not exists trial_locks_unique
  on public.trial_locks (lock_type, lock_hash);

-- opcional: RLS ligado (mas a Edge Function usa service role, então tanto faz)
alter table public.trial_locks enable row level security;
