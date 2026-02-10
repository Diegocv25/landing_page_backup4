create table if not exists public.email_confirm_tokens (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists email_confirm_tokens_user_unique
  on public.email_confirm_tokens (user_id)
  where used_at is null;

create unique index if not exists email_confirm_tokens_hash_unique
  on public.email_confirm_tokens (token_hash);

alter table public.email_confirm_tokens enable row level security;
