
## Objetivo
Implementar nesta Landing Page um fluxo de “Teste grátis” que:
1) leva o usuário para `/cadastro`,
2) cria a conta trial no **mesmo Supabase do sistema de gestão** via **Edge Function**,
3) grava o controle comercial em `cadastros_estabelecimento`,
4) garante `user_roles` com `role = 'admin'` e `salao_id = NULL`,
5) mostra toasts adequados e redireciona para o login do sistema existente.

---

## Premissas (confirmadas)
- Você vai **conectar este projeto ao mesmo Supabase do sistema**.
- A tabela `user_roles` **já existe** e **tem `salao_id`**.

---

## Dependências e o que precisa existir antes
### 1) Conexão com Supabase (mesmo projeto do sistema)
Como este projeto ainda não tem Supabase configurado (não há `supabase` no código e não há secrets do Supabase), vamos:
- Conectar o projeto ao Supabase existente do sistema (via integração do Lovable com Supabase).
- Isso permitirá:
  - Criar migrations (tabela nova)
  - Criar/deploy da Edge Function
  - Configurar secrets com segurança (ex.: `SUPABASE_SERVICE_ROLE_KEY`)

**Você vai precisar ter em mãos (do Supabase do sistema):**
- Project URL
- Anon public key
- Service role key (para ser salva como secret e usada somente na Edge Function)

---

## Parte A — Banco de dados (Supabase)
### 2) Criar tabela `cadastros_estabelecimento`
Criar via migration (SQL) exatamente com o que você pediu:

**Colunas**
- `id` uuid PK default `gen_random_uuid()`
- `user_id` uuid ref `auth.users(id)` **UNIQUE**
- `nome_estabelecimento` text
- `endereco` text
- `telefone` text
- `nome_proprietario` text
- `email` text
- `plano_atual` text default `'profissional'`
- `trial_inicio` timestamptz
- `trial_fim` timestamptz
- `acesso_ate` timestamptz
- `status` text default `'trial'`
- `created_at` timestamptz default `now()`

**Constraints importantes**
- `UNIQUE(user_id)`
- Não vamos colocar `NOT NULL` nas colunas de dados (além do necessário pro PK/relacionamento).

### 3) RLS (recomendado)
Mesmo que a landing não leia direto a tabela, é uma tabela com dados sensíveis (email/telefone/endereço). Então:
- Habilitar RLS na tabela.
- Criar políticas mínimas:
  - **SELECT**: usuário autenticado só pode ver sua própria linha (`user_id = auth.uid()`).
  - **UPDATE**: usuário autenticado só pode atualizar sua própria linha (opcional; a landing não precisa, mas é seguro).
  - **INSERT**: em geral vamos **evitar INSERT direto do client** (a Edge Function usa service role), então podemos:
    - ou não criar policy de insert,
    - ou criar policy restritiva (dependendo se o sistema de gestão vai escrever diretamente nessa tabela futuramente).

---

## Parte B — Edge Function (Supabase)
### 4) Criar Edge Function `public-signup-trial`
**Entrada JSON** (conforme seu prompt): nome_estabelecimento, endereco, telefone, nome_proprietario, email, password.

#### 4.1 Validação (server-side)
Usar `zod` na Edge Function para validar:
- `nome_estabelecimento`, `endereco`, `telefone`, `nome_proprietario`: string trim + mínimo (não vazio) + limite (ex. 200/500)
- `email`: email válido + trim + limite
- `password`: mínimo 8

Se inválido: retornar **400** com mensagem clara (ex.: `"Senha deve ter no mínimo 8 caracteres"`).

#### 4.2 Verificar se email já existe (409)
No Supabase Admin API, o “checar por email” nem sempre é um método direto em todas as versões; para garantir robustez:
- Tentaremos a checagem via Admin API (se disponível) e, principalmente:
- Na criação do usuário, se vier erro de “user already registered”, retornaremos **409** com `"Email já cadastrado"`.

Resultado: cumpre o requisito de não permitir duplicidade e ainda fica resiliente a variações de API.

#### 4.3 Criar usuário no Auth (Admin)
- Usar `SUPABASE_SERVICE_ROLE_KEY` (secret).
- Criar usuário com email/senha.
- Tentar setar email confirmado (quando suportado). Se não suportar, **não travar** o fluxo — apenas criar e permitir login conforme regra do projeto.

#### 4.4 Calcular datas do trial
- `trial_inicio = now`
- `trial_fim = now + 7 dias`
- `acesso_ate = trial_fim`

#### 4.5 UPSERT em `cadastros_estabelecimento` por `user_id`
- UPSERT com `onConflict: 'user_id'`
- Preencher todos os campos recebidos + defaults e datas:
  - status = 'trial'
  - plano_atual = 'profissional'
  - trial_inicio/trial_fim/acesso_ate

#### 4.6 Garantir `user_roles` (UPSERT/“insert ignore”)
Como `user_roles` já existe e tem `salao_id`, faremos:
- Inserir (ou “upsert”) registro garantindo:
  - `user_id = novo usuário`
  - `role = 'admin'`
  - `salao_id = null`

Observação técnica importante:
- Se a constraint única for `(user_id, role)`, o upsert deve conflitar em `(user_id, role)` (não apenas `user_id`).
- Se a constraint única for apenas `user_id`, conflita em `user_id`.
No plano de implementação eu vou primeiro olhar o schema real (no projeto Supabase conectado) para escolher o `onConflict` correto.

#### 4.7 Respostas
- **200**: `{ success: true, user_id }`
- **409**: `{ success: false, error: "Email já cadastrado" }`
- **400**: `{ success: false, error: "mensagem de validação" }`
- **500**: `{ success: false, error: "Erro interno do servidor" }`

#### 4.8 CORS
Adicionar tratamento de `OPTIONS` e headers CORS completos (para funcionar no browser).

---

## Parte C — Frontend (Landing)
### 5) Criar página `/cadastro`
Criar `src/pages/Cadastro.tsx` com layout conforme seu prompt:

**Topo**
- Título: “Comece seu teste gratuito”
- Subtítulo: “Crie sua conta e utilize o sistema no Plano Profissional por 7 dias gratuitamente. Sem cartão de crédito.”

**Badges**
- 7 dias grátis
- Plano Profissional
- Sem cartão
- Acesso imediato

**Formulário (3 seções)**
Implementar com:
- `react-hook-form`
- `zod` + `@hookform/resolvers/zod`
- Componentes shadcn já presentes (Button, Input, Label, Card, etc.)

Campos:
1) Estabelecimento
- nome_estabelecimento (obrigatório)
- endereco (obrigatório)
- telefone (obrigatório com máscara)

2) Proprietário
- nome_proprietario (obrigatório)
- email (obrigatório + formato)
  - helper text: “Este email será seu login no sistema”

3) Senha
- password (obrigatório, min 8) + botão mostrar/ocultar
- confirmPassword (obrigatório, igual ao password)

**Máscara de telefone**
Sem dependências novas:
- Implementar uma função `formatPhoneBR(value)` que:
  - remove não-dígitos
  - aplica máscara simples tipo `(XX) XXXXX-XXXX` (ou `(XX) XXXX-XXXX` quando tiver 10 dígitos)
- Usar `onChange` controlado no RHF para manter valor formatado.

**Link externo**
- “Já tem uma conta? Fazer login” -> link para:
  `https://id-preview--2195ef19-036f-4926-9a8e-4b3085c4a170.lovable.app/auth`

### 6) Comportamento no submit
Ao clicar “Criar minha conta grátis”:
1) Validar client-side (zod)
2) Chamar Edge Function `public-signup-trial`
3) Se sucesso:
   - Toast: “Conta criada com sucesso! 🎉”
   - Redirect (window.location.href) para o `/auth` do sistema
4) Se erro:
   - 409: “Este email já está cadastrado. Faça login.”
   - 400: mostrar mensagem específica retornada
   - 500: “Erro ao criar conta. Tente novamente.”
5) Manter os dados do form (padrão do RHF, sem reset)

**Detalhe técnico de chamada**
- Se estivermos com Supabase conectado neste projeto, podemos:
  - chamar via Supabase Functions client, ou
  - chamar via `fetch` na URL da função.
Vou escolher a abordagem mais estável após ver como o Supabase ficará disponível no projeto (e se teremos `@supabase/supabase-js` no frontend; atualmente não temos).

---

## Parte D — Rotas e CTAs
### 7) Adicionar rota `/cadastro`
Atualizar `src/App.tsx`:
- Importar `Cadastro`
- Adicionar `<Route path="/cadastro" element={<Cadastro />} />`

### 8) Atualizar botões “Teste grátis”/CTA do Hero e Header
- **HeroSection**: botão “Quero Testar por 7 Dias” navegar para `/cadastro`
- **Header**: botão “Teste grátis” (desktop e mobile) navegar para `/cadastro`

Implementação recomendada:
- Usar `react-router-dom` `<Link to="/cadastro">` com `Button asChild`.

---

## Parte E — Checagens e testes (rápidos, mas completos)
### 9) Checklist de validação end-to-end
1) Acessar `/` e clicar “Teste grátis” -> abre `/cadastro`
2) Submeter com campos vazios -> mensagens de validação
3) Submeter com senha < 8 -> validação
4) Submeter com email já cadastrado -> toast 409
5) Submeter com novo email -> sucesso + redirect para o `/auth` do sistema
6) Conferir no Supabase:
   - usuário criado em Auth
   - linha em `cadastros_estabelecimento` com datas corretas
   - `user_roles` com `role='admin'` e `salao_id=null`

---

## Riscos / pontos de atenção
- **Schema real de `user_roles`**: precisamos alinhar o `onConflict` ao constraint real (ex.: `unique(user_id, role)`).
- **Auto-confirmação de email**: dependendo da config do Supabase Auth, pode não ser possível “confirmar” automaticamente; o fluxo não pode quebrar por isso (vamos tolerar).
- **Segurança**: Service role key nunca vai para o frontend; fica somente como secret na Edge Function.

---

## Arquivos que serão criados/alterados (previsão)
- Alterar: `src/App.tsx` (nova rota)
- Criar: `src/pages/Cadastro.tsx`
- Alterar: `src/components/HeroSection.tsx` (CTA -> /cadastro)
- Alterar: `src/components/Header.tsx` (botões -> /cadastro)
- Criar: `supabase/functions/public-signup-trial/index.ts`
- Alterar/criar: `supabase/config.toml` (config da função, CORS/verify_jwt conforme necessário)
- Migration SQL: criação da tabela + RLS policies

---

## O que eu preciso de você (quando formos implementar)
1) Aprovar este plano.
2) Ter o projeto **conectado ao Supabase do sistema** (mesmo backend), para conseguirmos:
   - criar a migration
   - criar/deploy da edge function
   - adicionar secret `SUPABASE_SERVICE_ROLE_KEY`



ajuste esses pontos: 
AJUSTE DO PLANO (obrigatório)

1. Supabase
• Conectar este projeto ao MESMO Supabase do sistema de gestão:
https://idampxfbqakcdamqxgqe.supabase.co
• Usar a anon key desse mesmo projeto no frontend.
• A service role key deve ser usada somente dentro da Edge Function como secret (SUPABASE_SERVICE_ROLE_KEY). Nunca expor no React.
2. Edge Function public-signup-trial — CORS e gateway
• Implementar CORS explícito e completo:  • responder OPTIONS
  • incluir headers:
Access-Control-Allow-Origin (com base no Origin, ou permitir a origem do domínio da landing/preview)
Access-Control-Allow-Headers: authorization, apikey, content-type
Access-Control-Allow-Methods: POST, OPTIONS

• No frontend, não usar credentials: "include" nas chamadas (evitar problemas de CORS).
3. JWT / 401 do gateway
• Garantir que essa Edge Function rode com verify_jwt = false (não exigir JWT).
• Confirmar que no Supabase Edge Functions está desativado o toggle “Verify JWT with legacy secret” (senão pode dar 401 Invalid JWT antes da function executar).
4. user_roles sem duplicação
• Ao inserir user_roles, garantir que não cria duplicados:  • usar upsert com onConflict correto conforme o constraint real (ex.: user_id ou (user_id, role)), ou checar antes de inserir.

