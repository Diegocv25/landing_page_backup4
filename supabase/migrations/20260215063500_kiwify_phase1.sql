-- Kiwify phase 1: campos de status/eventos no mesmo cadastro (payment_sessions)

ALTER TABLE public.payment_sessions
ADD COLUMN IF NOT EXISTS status_pagamento text,
ADD COLUMN IF NOT EXISTS ultimo_evento text,
ADD COLUMN IF NOT EXISTS data_ultimo_evento timestamptz,
ADD COLUMN IF NOT EXISTS payload_raw jsonb,
ADD COLUMN IF NOT EXISTS event_id text;

CREATE INDEX IF NOT EXISTS payment_sessions_event_id_idx
  ON public.payment_sessions (event_id)
  WHERE event_id IS NOT NULL;
