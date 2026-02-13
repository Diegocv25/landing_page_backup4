-- Migration: Add verification, user creation tracking, and tax_id to payment_sessions

ALTER TABLE public.payment_sessions
ADD COLUMN IF NOT EXISTS verification_token text,
ADD COLUMN IF NOT EXISTS email_verified_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS created_user_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS tax_id text;

-- Unique index for verification_token (safe)
CREATE UNIQUE INDEX IF NOT EXISTS payment_sessions_verification_token_unique
  ON public.payment_sessions (verification_token)
  WHERE verification_token IS NOT NULL;
