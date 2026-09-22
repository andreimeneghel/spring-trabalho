# SoundHub — Frontend

Interface web do SoundHub. Next.js 16 (App Router), TypeScript, Tailwind CSS e shadcn/ui.

A especificacao completa — contrato da API, decisoes de cache, identidade visual e checklist de
entrega — esta em [../FRONTEND.md](../FRONTEND.md).

---

## Rodar

A API precisa estar no ar antes (ver [../README.md](../README.md)).

```bash
cp .env.example .env.local    # no Windows: copy .env.example .env.local
npm install
npm run dev
```

Abre em `http://localhost:3000`.

### Variaveis de ambiente

| Variavel | Para que serve |
|---|---|
| `API_URL` | Endereco da API Spring. Sem prefixo `NEXT_PUBLIC_`: so o servidor do Next acessa. |
| `MOCK_MUSICAS` | `true` usa um catalogo de exemplo enquanto os endpoints de Musica nao existem. |

---

## Como a autenticacao funciona

O token JWT fica num cookie `httpOnly` (`soundhub_sessao`). O navegador conversa apenas com o
servidor do Next, que repassa as chamadas para a API com o header `Authorization`:

```
navegador → Next (Server Action / Server Component) → API Spring
            ↑ cookie httpOnly                         ↑ Bearer token
```

O token nunca chega ao JavaScript da pagina, entao um XSS nao consegue rouba-lo — o que
aconteceria se ele ficasse no `localStorage`.

O arquivo [src/proxy.ts](src/proxy.ts) protege as rotas: sem cookie, redireciona para `/login`
guardando o destino. Ele so verifica se o cookie existe; a validacao real do token acontece
quando a API responde `401`, e ai [src/lib/api/guard.ts](src/lib/api/guard.ts) derruba a sessao.

---

## Telas

| Rota | O que faz |
|---|---|
| `/login` · `/registrar` | Autenticacao, com escolha entre OUVINTE e ARTISTA |
| `/playlists` | Suas playlists |
| `/playlists/nova` | Criar playlist |
| `/playlists/[id]` | Detalhe com as musicas, adicionar e remover |
| `/playlists/[id]/editar` | Editar nome, descricao e privacidade |
| `/descobrir` | Playlists publicas, com busca |
| `/avaliacoes` | Suas avaliacoes, editaveis no lugar |
| `/perfil` | Editar dados e alterar senha |

---

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de producao
npm run start    # roda o build
npm run lint     # eslint
npx tsc --noEmit # checagem de tipos
```
