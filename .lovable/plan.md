
# Plano: Corrigir Legibilidade do Texto no Tema Escuro

## Problema Identificado
O site está configurado com um tema escuro (background escuro), mas as variáveis de cores base no CSS estão definidas para o modo claro. A classe `dark` está aplicada apenas no componente Index, mas as variáveis CSS do `:root` (modo claro) definem:
- `--foreground: 0 0% 5%` (texto muito escuro)
- `--muted-foreground: 0 0% 45%` (texto cinza escuro)

Isso faz com que o texto fique ilegivel sobre o fundo escuro.

## Solucao

Trocar as variaveis do `:root` (modo padrao) pelas variaveis do modo escuro, tornando o tema escuro o padrao do site.

## Arquivos a Modificar

### 1. `src/index.css`
Inverter as variaveis CSS para que o modo escuro seja o padrao:

**Antes (`:root` claro, `.dark` escuro):**
```css
:root {
  --background: 0 0% 100%;       /* branco */
  --foreground: 0 0% 5%;         /* quase preto */
  --muted-foreground: 0 0% 45%;  /* cinza escuro */
  ...
}
```

**Depois (`:root` escuro):**
```css
:root {
  --background: 0 0% 4%;         /* quase preto */
  --foreground: 0 0% 98%;        /* quase branco */
  --muted-foreground: 0 0% 65%;  /* cinza claro */
  --card: 0 0% 7%;
  --card-foreground: 0 0% 98%;
  --secondary: 0 0% 12%;
  --secondary-foreground: 0 0% 98%;
  ...
}
```

### 2. `src/pages/Index.tsx`
Remover a classe `dark` que nao sera mais necessaria:

```tsx
<div className="min-h-screen bg-background">
```

## Resultado Esperado
- Todos os textos ficarao visiveis (brancos/claros) sobre o fundo escuro
- Os textos secundarios (`text-muted-foreground`) ficarao em cinza claro
- Os titulos e textos principais ficarao em branco
- Nao sera necessario adicionar `text-white` manualmente em cada componente

## Secao Tecnica

### Variaveis CSS que serao atualizadas no `:root`:
| Variavel | Valor Antigo | Valor Novo |
|----------|--------------|------------|
| `--background` | `0 0% 100%` | `0 0% 4%` |
| `--foreground` | `0 0% 5%` | `0 0% 98%` |
| `--card` | `0 0% 100%` | `0 0% 7%` |
| `--card-foreground` | `0 0% 5%` | `0 0% 98%` |
| `--popover` | `0 0% 100%` | `0 0% 7%` |
| `--popover-foreground` | `0 0% 5%` | `0 0% 98%` |
| `--secondary` | `0 0% 96%` | `0 0% 12%` |
| `--secondary-foreground` | `0 0% 5%` | `0 0% 98%` |
| `--muted` | `0 0% 96%` | `0 0% 15%` |
| `--muted-foreground` | `0 0% 45%` | `0 0% 65%` |
| `--border` | `0 0% 90%` | `0 0% 18%` |
| `--input` | `0 0% 90%` | `0 0% 18%` |

A classe `.dark` pode ser removida ou mantida para uso futuro (toggle de tema).
