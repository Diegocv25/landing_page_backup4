# Nexus — Landing Page (landing_page_backup4)

Landing page do Nexus com fluxo de **cadastro + trial** e encaminhamento para o produto principal.

## Papel no ecossistema
- Entrada do usuário (marketing → cadastro)
- Criação/ativação de acesso inicial (trial)
- Encaminhamento para o sistema de gestão/portal

## Integrações
- **Supabase** (banco e autenticação)
- **Pagamento:** Kiwipay/Kiwify (**migração concluída**; fluxo funcional)
- **E-mail:** Resend

## Status atual
- Fluxos principais estão funcionais.
- Pendente apenas o que depende de **domínio próprio**:
  - ajustes de remetente/validação no Resend (hoje limitado a e-mails de teste)
  - URLs finais/canônicas de retorno/redirect conforme domínio

## Rodar local
```bash
npm install
npm run dev
```

## Deploy
- Deploy via Vercel (GitHub).

## Documentação de comportamento (fonte de verdade)
- `/root/.openclaw/workspace/docs/behavior/landing_page_backup4/`

## Notas
- Qualquer ajuste que envolva links externos, redirects, e e-mail deve ser revisado quando o domínio estiver definido.
