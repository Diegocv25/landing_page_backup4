
## Objetivo desta etapa
Atualizar o frontend da landing (página `/cadastro`) para ficar compatível com a Edge Function atualizada (anti-fraude via `trial_locks`) e com as novas regras:
- Enviar `device_fingerprint` no payload (quando disponível).
- Ajustar mensagens de erro (especialmente 409).
- Redirecionar para o login do sistema “fora do iframe” (evitar embed do Lovable).

## O que eu conferi no código atual (estado do repo)
- `src/pages/Cadastro.tsx` já:
  - Divide endereço em: `rua`, `numero`, `bairro`, `cep`, `cidade`, `estado` e monta `endereco` em texto único (ok).
  - Usa `supabase.functions.invoke("public-signup-trial", { body })` (ok; não usa `credentials: "include"`).
  - Hoje trata `409` como “Email já cadastrado”, mas agora `409` também pode indicar bloqueio por `trial_locks`.
- `supabase/functions/public-signup-trial/index.ts` já:
  - Aceita `device_fingerprint` (opcional).
  - Faz CORS com `x-client-info` (ok).
  - Retorna `409` tanto para “Email já cadastrado” quanto para “Teste grátis já utilizado para alguns dos dados informados.”
  - Não auto-confirma email (ok).
- `supabase/config.toml` já com `verify_jwt = false` para a function (ok).

## Implementação (frontend)

### 1) Gerar e enviar `device_fingerprint` no Cadastro
**Onde:** `src/pages/Cadastro.tsx`

**Como (MVP sem biblioteca):**
- Criar uma função que monta uma string “normalizada” com dados do device:
  - `navigator.userAgent`
  - `navigator.language`
  - `screen.width` / `screen.height`
  - `Intl.DateTimeFormat().resolvedOptions().timeZone`
  - (opcional) `navigator.platform`, `navigator.hardwareConcurrency` (se existir)
- Gerar um hash SHA-256 dessa string no browser usando `crypto.subtle.digest`.
  - Isso manda para o backend um identificador estável sem enviar o texto cru (melhor privacidade).
- Computar isso no `useEffect` ao abrir a página e salvar em `useState`.
- No `onSubmit`, incluir `device_fingerprint` apenas se:
  - já estiver calculado e não vazio.

**Resultado esperado:**
- Payload enviado passa a conter:
  - `device_fingerprint: "<sha256-hex>"` (64 chars), quando possível.

### 2) Ajustar tratamento de erro (toasts) para 409/400/500
**Onde:** `src/pages/Cadastro.tsx`

**Nova regra para 409:**
- Se a function devolver `409`, mostrar:
  - **Título:** “Teste grátis indisponível”
  - **Descrição:** “Teste grátis já utilizado para alguns dos dados informados. Se você já tem conta, faça login. Caso precise de acesso, entre em contato para assinar.”
  - (Se quiser manter o caso especial “Email já cadastrado”, tratamos assim:)
    - Se `serverMsg` contiver “Email já cadastrado”, manter o toast atual de login.
    - Caso contrário, usar o toast de bloqueio de trial.

**Para 400:**
- Manter: mostrar `serverMsg` vindo do backend (validação específica).

**Para 500/outros:**
- Manter mensagem genérica “Erro ao criar conta. Tente novamente.”

### 3) Redirecionar para o login fora do iframe
**Onde:** `src/pages/Cadastro.tsx`

**Mudança:**
- No sucesso, trocar:
  - `window.location.href = SYSTEM_AUTH_URL`
- Por:
  - Tentar `window.top.location.href = SYSTEM_AUTH_URL`
  - Se der erro (cross-origin / restrição), fallback para `window.location.href = SYSTEM_AUTH_URL`

**Por que:**
- Evita que o usuário “entre no sistema” preso dentro do iframe do editor do Lovable.

## Plano de testes (end-to-end)
1) Abrir `/cadastro` e concluir cadastro com dados novos:
   - Deve criar usuário (não confirmado), criar `trial_locks`, `saloes`, `user_roles`, `cadastros_estabelecimento`.
   - Deve mostrar toast de sucesso e redirecionar fora do iframe.
2) Repetir cadastro com dados “iguais” (telefone/endereço/nome/IP/fingerprint):
   - Deve retornar 409 e mostrar toast de “Teste grátis indisponível”.
3) Testar email já existente:
   - Deve retornar 409 com “Email já cadastrado” e mostrar toast de “Email já cadastrado”.
4) Garantir que não há erro de CORS no browser (especialmente preflight com `x-client-info`).

## Arquivos que serão alterados
- `src/pages/Cadastro.tsx`
  - Adicionar gerador/hash de fingerprint
  - Incluir `device_fingerprint` no payload
  - Ajustar toasts para 409
  - Ajustar redirect para `window.top.location.href` com fallback

## Observações importantes de segurança (mantidas)
- Não armazenar senha em nenhuma tabela (continua ok).
- Não expor `SUPABASE_SERVICE_ROLE_KEY` no React (continua ok).

só para complementar:
1. Fingerprint com fallback (não pode quebrar cadastro)
• Se crypto.subtle não existir ou der erro, o código deve:  • enviar device_fingerprint vazio/undefined
  • continuar o cadastro normalmente (sem travar a UX)

2. Tratamento do 409 por mensagem do servidor
• 409 agora significa 2 coisas:  • “Email já cadastrado” → toast orientando a fazer login
  • “Teste grátis já utilizado…” → toast de bloqueio do trial

• Então no frontend, checar o texto retornado (error) e escolher o toast correto.
Opcional (se quiser uma 3ª, mas não é obrigatório):
3) Redirect fora do iframe

• Usar window.top.location.href com fallback para window.location.href (pra não logar “embutido” e dar 401 estranho).
