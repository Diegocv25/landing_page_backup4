-- payment_sessions: controle de checkout (independente de trial_locks)
CREATE TABLE IF NOT EXISTS public.payment_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text NOT NULL,
  nome_estabelecimento text,
  endereco text,
  telefone text,
  nome_proprietario text,
  plan_id text NOT NULL,                          -- 'profissional' | 'pro_ia'
  amount_cents int NOT NULL,
  provider text NOT NULL DEFAULT 'abacatepay',
  provider_bill_id text,                          -- id da cobrança no AbacatePay (bill_xxx)
  provider_checkout_url text,                     -- URL do checkout hospedado
  status text NOT NULL DEFAULT 'pending',         -- pending | paid | failed | expired
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

-- Índice para busca rápida por bill_id (webhook)
CREATE UNIQUE INDEX IF NOT EXISTS payment_sessions_provider_bill_id_unique
  ON public.payment_sessions (provider_bill_id)
  WHERE provider_bill_id IS NOT NULL;

-- RLS ativado (apenas service role opera via Edge Functions)
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
