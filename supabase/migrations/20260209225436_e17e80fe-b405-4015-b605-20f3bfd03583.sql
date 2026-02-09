-- Create cadastros_estabelecimento table
CREATE TABLE IF NOT EXISTS public.cadastros_estabelecimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_estabelecimento text,
  endereco text,
  telefone text,
  nome_proprietario text,
  email text,
  plano_atual text DEFAULT 'profissional',
  trial_inicio timestamptz,
  trial_fim timestamptz,
  acesso_ate timestamptz,
  status text DEFAULT 'trial',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cadastros_estabelecimento_user_id_unique UNIQUE (user_id)
);

-- Enable RLS (table contains sensitive PII)
ALTER TABLE public.cadastros_estabelecimento ENABLE ROW LEVEL SECURITY;

-- Policies (no client-side insert; edge function uses service role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cadastros_estabelecimento' 
      AND policyname = 'Users can view own cadastro'
  ) THEN
    CREATE POLICY "Users can view own cadastro"
    ON public.cadastros_estabelecimento
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'cadastros_estabelecimento' 
      AND policyname = 'Users can update own cadastro'
  ) THEN
    CREATE POLICY "Users can update own cadastro"
    ON public.cadastros_estabelecimento
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;