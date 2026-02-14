# DESLOVABLE_PLAN.md — Plano de refatoração para remover amarras do Lovable

## Objetivo
Eliminar dependências de runtime e build do Lovable (URLs de preview, redirects hardcoded, CORS com fallback Lovable, tooling) e permitir rodar landing+gestão em qualquer host.

## Contexto
- Sem domínio próprio por enquanto.
- Ambiente temporário recomendado para HTTPS: Cloudflare Tunnel (Jarvis).

## Principais amarras identificadas (alto impacto)
### Landing (`landing_page_backup4`)
- `SYSTEM_AUTH_URL` hardcoded apontando para preview Lovable:
  - `src/pages/Planos.tsx`
  - `src/pages/Cadastro.tsx`
  - `src/pages/CriarSenha.tsx`
  - `src/pages/PagamentoRetorno.tsx`

**Ação:** trocar por env `VITE_AUTH_BASE_URL`.

### Gestão (`gestao_backup4`) — Edge Functions do portal
- ~15 funções `portal-*` com:
  - regex permitindo `lovable.app|lovableproject.com`
  - fallback `Access-Control-Allow-Origin` para `id-preview--...lovable.app`

**Ação:** substituir por `ALLOWED_ORIGINS` (CSV) + fallback seguro (negar ou `null`).

### Gestão — Reset de senha
- `supabase/functions/portal-password-reset-request/index.ts` monta `resetUrl` com preview Lovable.

**Ação:** trocar por `AUTH_BASE_URL` (ou `APP_BASE_URL`).

### Checkout (extra)
- `landing_page_backup4/supabase/functions/create-abacate-checkout/index.ts` tem fallback de origin `https://nexus-automacoes.com`.

**Ação:** trocar por `PAYMENT_RETURN_URL` ou `APP_BASE_URL` via env.

## Variáveis canônicas
Frontend:
- `VITE_APP_BASE_URL`
- `VITE_AUTH_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Backend/Functions:
- `APP_BASE_URL`
- `LANDING_BASE_URL` (opcional)
- `AUTH_BASE_URL`
- `ALLOWED_ORIGINS` (CSV)
- `PAYMENT_RETURN_URL`
- `WEBHOOK_BASE_URL` (opcional)

## Plano por fatias (commits/branches)
1) **Fatia 1 — URLs hardcoded → env**
   - landing: trocar `SYSTEM_AUTH_URL` -> `import.meta.env.VITE_AUTH_BASE_URL`
   - gestão: resetUrl -> `Deno.env.get('AUTH_BASE_URL')` (ou `APP_BASE_URL`)

2) **Fatia 2 — CORS Lovable → ALLOWED_ORIGINS**
   - criar helper comum (copiar para as functions portal, ou módulo local)
   - remover fallback de preview

3) **Fatia 3 — Checkout fallback**
   - remover domínio fixo e usar env

4) **Fatia 4 — Limpeza tooling/documentação**
   - `lovable-tagger` via feature flag ou remoção
   - limpar README/.lovable

## Critério de pronto
- Nenhuma URL `lovable.app` necessária para fluxo:
  - compra → e-mail → login
  - reset de senha
  - portal calls
- CORS funciona para:
  - URLs temporárias (tunnel)
  - localhost dev
