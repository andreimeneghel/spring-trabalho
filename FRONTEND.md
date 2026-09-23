# SoundHub — Guia do Frontend

Documento de especificacao para quem vai construir o frontend do SoundHub. Cobre o contrato da
API, as regras de autenticacao, a estrutura de pastas, a identidade visual e as decisoes de
cache.

**Stack definida:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui

> **Este documento e a especificacao; o codigo em `front/` ja a implementa.** Dois pontos
> divergem de proposito do que esta escrito abaixo, e o codigo e que vale:
>
> 1. **`middleware.ts` virou `proxy.ts`** — o Next 16 renomeou a convencao, e a funcao passa a
>    ser `export default function proxy(...)`. O conteudo e identico.
> 2. **Cache: tudo autenticado usa `cache: "no-store"`**, nao `next: { tags }`. Como toda
>    chamada leva o token do usuario, uma tag global entregaria a playlist de um usuario para
>    outro. A invalidacao apos mutacao e feita com `revalidatePath`. A secao
>    [Cache e performance](#6-cache-e-performance) explica o raciocinio; leia o aviso em
>    destaque la.

> **Escopo:** a API hoje entrega **Autenticacao, Usuario, Playlist e Avaliacao**. Os modulos de
> **Musica, Categoria, Artista e Album** estao sendo construidos por outros integrantes. A secao
> [Endpoints futuros](#endpoints-futuros) descreve como o front deve se preparar para eles sem
> travar o desenvolvimento agora.

---

## Sumario

1. [Como rodar](#1-como-rodar)
2. [Contrato da API](#2-contrato-da-api)
3. [Autenticacao e seguranca](#3-autenticacao-e-seguranca)
4. [Estrutura de pastas](#4-estrutura-de-pastas)
5. [Identidade visual](#5-identidade-visual)
6. [Cache e performance](#6-cache-e-performance)
7. [Telas a construir](#7-telas-a-construir)
8. [Endpoints futuros](#8-endpoints-futuros)
9. [Checklist de entrega](#9-checklist-de-entrega)

---

## 1. Como rodar

### Backend (precisa estar no ar)

```bash
docker compose up -d      # sobe o Postgres
./mvnw spring-boot:run  ou
 mvnw.cmd spring-boot:run   # API em http://localhost:8080
```

Swagger com todos os endpoints: `http://localhost:8080/swagger-ui.html`

### Criar o projeto

```bash
npx create-next-app@latest soundhub-web \
  --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

cd soundhub-web
npx shadcn@latest init
```

### Variaveis de ambiente

`.env.local` (nao commitar):

```env
# URL da API — usada apenas no servidor (Route Handlers e Server Components)
API_URL=http://localhost:8080

# Segredo para assinar o cookie de sessao (gere com: openssl rand -base64 32)
SESSION_SECRET=troque-isto-por-um-valor-aleatorio
```

> **Nao use `NEXT_PUBLIC_` para a URL da API.** Tudo que leva esse prefixo e embutido no bundle
> e fica visivel no navegador. As chamadas passam pelo servidor do Next (ver
> [secao 3](#3-autenticacao-e-seguranca)).

Commite um `.env.example` com as chaves vazias, para o resto do time saber o que configurar.

### CORS

O backend libera `http://localhost:3000` por padrao. Se voce rodar o front em outra porta,
ajuste no backend via variavel de ambiente:

```bash
export CORS_ORIGENS=http://localhost:3001
```

---

## 2. Contrato da API

Base URL: `http://localhost:8080`

### Tipos TypeScript

Crie `src/types/api.ts` espelhando exatamente os DTOs do backend:

```ts
export type TipoUsuario = "OUVINTE" | "ARTISTA";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
}

export interface TokenResponse {
  token: string;
  tipo: "Bearer";
  expiraEmSegundos: number; // 86400 = 24h
  usuario: Usuario;
}

export interface PlaylistResumo {
  id: number;
  nome: string;
  descricao: string | null;
  publica: boolean;
  capa: string | null; // data URI base64 (PNG/JPG) ou null
  criadaEm: string; // ISO: "2026-09-22T10:15:30"
  donoId: number;
  donoNome: string;
  totalMusicas: number;
}

export interface MusicaDaPlaylist {
  musicaId: number;
  titulo: string;
  duracao: number; // segundos
  artista: string | null;
  ordem: number; // comeca em 0
}

export interface PlaylistDetalhe extends Omit<PlaylistResumo, "totalMusicas"> {
  totalMusicas: number;
  duracaoTotal: number; // segundos
  musicas: MusicaDaPlaylist[];
}

export interface Avaliacao {
  id: number;
  nota: number; // 1 a 5
  comentario: string | null;
  criadaEm: string;
  atualizadaEm: string | null;
  usuarioId: number;
  usuarioNome: string;
  musicaId: number;
  musicaTitulo: string;
}

export interface MediaAvaliacao {
  musicaId: number;
  musicaTitulo: string;
  media: number; // 0.0 quando nao ha avaliacoes
  totalAvaliacoes: number;
}

export interface ArtistaResumo {
  id: number;
  nomeArtistico: string;
  biografia: string | null;
  foto: string | null;        // data URI base64 (PNG/JPG) ou null
  usuarioId: number;
  usuarioNome: string;
}

export interface ArtistaDetalhe extends ArtistaResumo {
  totalAlbuns: number;
  totalMusicas: number;
  albuns: AlbumResumo[];
}

export interface AlbumResumo {
  id: number;
  titulo: string;
  anoLancamento: number | null;
  capa: string | null;        // data URI base64 (PNG/JPG) ou null
  artistaId: number;
  artistaNome: string;
}

export interface AlbumDetalhe extends AlbumResumo {
  totalMusicas: number;
}

/** Formato unico de erro da API. */
export interface ErroResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  campos?: Record<string, string>; // presente apenas em erro de validacao (400)
}
```

### Endpoints disponiveis

#### Autenticacao — publico

| Metodo | Rota              | Body                           | Resposta              |
| ------ | ----------------- | ------------------------------ | --------------------- |
| POST   | `/auth/registrar` | `{ nome, email, senha, tipo }` | `201` `TokenResponse` |
| POST   | `/auth/login`     | `{ email, senha }`             | `200` `TokenResponse` |

Regras de validacao: `nome` ate 100 chars; `email` formato valido, ate 150; `senha` entre 6 e
50; `tipo` e `"OUVINTE"` ou `"ARTISTA"`.

> **Limite de tentativas no login.** Depois de **4 senhas erradas seguidas** para o mesmo
> email, `/auth/login` passa a responder **`429`** por **60 segundos**. A resposta traz o
> header `Retry-After` (segundos) e a `mensagem` ja formatada — _"Muitas tentativas de login.
> Tente novamente em 45 segundos"_. Um login correto zera a contagem, e ficar 15 minutos sem
> tentar tambem.
>
> **O que o front faz:** na quarta falha, o `loginAction` repassa a `mensagem` da API e o
> header `Retry-After`. O formulário mostra a mensagem para aguardar, exibe a contagem
> regressiva e desabilita o botão até os 60 segundos terminarem.

#### Usuario — exige token

| Metodo | Rota                   | Observacao                                       |
| ------ | ---------------------- | ------------------------------------------------ |
| GET    | `/usuarios`            | Lista todos                                      |
| GET    | `/usuarios/me`         | **Use esta para hidratar a sessao**              |
| GET    | `/usuarios/{id}`       |                                                  |
| PUT    | `/usuarios/{id}`       | `{ nome, email }` — so a propria conta           |
| PATCH  | `/usuarios/{id}/senha` | `{ senhaAtual, novaSenha }` — so a propria conta |
| DELETE | `/usuarios/{id}`       | So a propria conta                               |

#### Playlist — exige token

| Metodo | Rota                                 | Observacao                                       |
| ------ | ------------------------------------ | ------------------------------------------------ |
| GET    | `/playlists`                         | Publicas de todos + as suas (inclusive privadas) |
| GET    | `/playlists/minhas`                  | Somente as suas                                  |
| GET    | `/playlists/usuario/{usuarioId}`     | Privadas so aparecem se for voce                 |
| GET    | `/playlists/busca?nome=rock`         | Busca **somente em playlists publicas**          |
| GET    | `/playlists/{id}`                    | Detalhe com as musicas ordenadas                 |
| POST   | `/playlists`                         | `{ nome, descricao?, publica?, capa? }` → `201`  |
| PUT    | `/playlists/{id}`                    | Mesmo body do POST — so o dono                   |
| DELETE | `/playlists/{id}`                    | `204` — so o dono                                |
| POST   | `/playlists/{id}/musicas`            | `{ musicaId }` — adiciona no fim                 |
| DELETE | `/playlists/{id}/musicas/{musicaId}` | Remove e reordena                                |

Regras que o front precisa respeitar:

- `nome` obrigatorio, ate 100 chars; `descricao` opcional, ate 300.
- `publica` omitido = `true`.
- `capa` opcional: data URI base64, **somente PNG ou JPG**, ate 2MB. String vazia ou
  omitida grava `null`. Outro formato (GIF, SVG) volta `400` com a mensagem no campo
  `capa`. SVG e barrado de proposito: poderia carregar script.
- Nome duplicado **para o mesmo usuario** → `409`.
- Musica ja presente na playlist → `409`.
- Limite de 500 musicas por playlist → `400`.
- Ao adicionar ou remover, a resposta ja traz a **playlist inteira atualizada** — use esse
  retorno para atualizar o estado em vez de refazer o GET.

> **Capa da playlist — o que o front faz.** Ja implementado em
> `components/playlist/seletor-capa.tsx`: le o arquivo com `FileReader.readAsDataURL`,
> valida tipo e tamanho **antes** de enviar (para o usuario ver o erro na hora) e guarda o
> data URI num `<input type="hidden" name="capa">`, que vai junto no submit do formulario.
> A capa aparece no card da listagem (quadrado a esquerda, estilo Spotify) e grande no
> detalhe da playlist. Sem capa, mostra um icone de nota musical sobre fundo verde.
>
> Imagens base64 usam `<img>` comum, nao `next/image` — o otimizador do Next nao processa
> data URI.

#### Avaliacao — exige token

| Metodo | Rota                                   | Observacao                              |
| ------ | -------------------------------------- | --------------------------------------- |
| GET    | `/musicas/{musicaId}/avaliacoes`       | Lista da musica, mais recentes primeiro |
| GET    | `/musicas/{musicaId}/avaliacoes/media` | `{ media, totalAvaliacoes }`            |
| POST   | `/musicas/{musicaId}/avaliacoes`       | `{ nota, comentario? }` → `201`         |
| GET    | `/avaliacoes/minhas`                   | Suas avaliacoes                         |
| GET    | `/avaliacoes/{id}`                     |                                         |
| PUT    | `/avaliacoes/{id}`                     | Mesmo body — so o autor                 |
| DELETE | `/avaliacoes/{id}`                     | `204` — so o autor                      |

Regras:

- `nota` de 1 a 5 (inteiro); `comentario` opcional, ate 500 chars.
- **Uma avaliacao por usuario por musica.** Se ja existe → `409`. A UI deve detectar isso e
  alternar para modo de edicao (`PUT`) em vez de mostrar erro cru.
- Artista nao pode avaliar a propria musica → `400`.

#### Artista e Album — exige token

| Metodo | Rota                          | Observacao                                             |
| ------ | ----------------------------- | ------------------------------------------------------ |
| GET    | `/artistas`                   | Lista todos — qualquer logado                          |
| GET    | `/artistas/busca?nome=banda`  | Busca pelo nome artistico                              |
| GET    | `/artistas/meu-perfil`        | Seu perfil de artista (`404` se nao tiver)             |
| GET    | `/artistas/{id}`              | Detalhe com contagens e os albuns                      |
| POST   | `/artistas`                   | `{ nomeArtistico, biografia?, foto? }` → `201` — so ARTISTA |
| PUT    | `/artistas/{id}`              | Mesmo body do POST — so ARTISTA e so o dono            |
| DELETE | `/artistas/{id}`              | `204` — so ARTISTA e so o dono                         |
| GET    | `/albuns`                     | Lista todos — qualquer logado                          |
| GET    | `/albuns/busca?titulo=raizes` | Busca pelo titulo                                      |
| GET    | `/albuns/artista/{artistaId}` | Albuns de um artista, mais recentes primeiro           |
| GET    | `/albuns/{id}`                | Detalhe com a quantidade de musicas                    |
| POST   | `/albuns`                     | `{ titulo, anoLancamento?, capa? }` → `201` — so ARTISTA |
| PUT    | `/albuns/{id}`                | Mesmo body do POST — so ARTISTA e so o dono            |
| DELETE | `/albuns/{id}`                | `204` — so ARTISTA e so o dono                         |

Regras que o front precisa respeitar:

- **Escrita so para usuario `tipo: "ARTISTA"`.** Ouvinte que tentar `POST`, `PUT` ou
  `DELETE` nessas rotas leva `403`. Esconda os botoes de cadastro quando
  `usuario.tipo !== "ARTISTA"` — mas trate o `403` mesmo assim.
- **Alterar e excluir: so o dono.** Mexer no perfil de artista de outra pessoa, ou num
  album que nao e seu, volta `403`.
- **O perfil de artista e 1:1 com o usuario.** O `POST /artistas` cria o perfil de quem
  esta logado — o `usuarioId` nao vai no body. Tentar criar um segundo perfil → `409`.
- `nomeArtistico` obrigatorio, ate 100 chars, **unico no sistema** (duplicado → `409`).
- `biografia` opcional, ate 1000 chars. String vazia grava `null`.
- **O album tambem nao recebe `artistaId` no body**: ele e vinculado ao perfil de artista
  do usuario logado. Se o usuario ainda nao tem perfil → `400` com a mensagem pedindo
  para criar o perfil antes.
- `titulo` obrigatorio, ate 150 chars, **unico dentro do mesmo artista** (duplicado → `409`).
- `anoLancamento` opcional, entre `1900` e o ano atual. Fora disso → `400`.
- **Excluir artista com album ou musica → `400`.** Apague os albuns e as musicas antes. A
  regra existe porque o banco apagaria tudo em cascata sem avisar.
- Excluir um album **nao apaga as musicas** dele: elas ficam sem album (`albumId: null`).
- `foto` (artista) e `capa` (album) sao opcionais: data URI base64, **somente PNG ou JPG**,
  ate 2MB. String vazia ou omitida grava `null`. Outro formato (GIF, SVG) volta `400` com a
  mensagem no campo. SVG e barrado de proposito: poderia carregar script.

> **Imagens de artista e album — o que o front faz.** Ja implementado em
> `components/comum/seletor-imagem.tsx`, o mesmo componente usado na capa da playlist: le o
> arquivo com `FileReader.readAsDataURL`, valida tipo e tamanho **antes** de enviar e guarda
> o data URI num `<input type="hidden">`, que vai junto no submit. A foto do artista usa
> `formato="circulo"`; a capa do album, o quadrado padrao. As imagens aparecem nos cards de
> Descobrir, no perfil publico do artista e na area de gestao. Sem imagem, cai no icone
> sobre fundo verde.
>
> Imagens base64 usam `<img>` comum, nao `next/image` — o otimizador nao processa data URI.

> **Para o front:** o fluxo natural e `GET /artistas/meu-perfil` ao entrar na area do
> artista. Se voltar `404`, mostre a tela de "criar perfil de artista" em vez de erro; se
> voltar `200`, mostre o perfil com os albuns e o botao de novo album. Use `ArtistaDetalhe`
> — ele ja traz os albuns, sem precisar de uma segunda chamada.

### Tratamento de erros

Toda falha volta no mesmo formato. Centralize o parsing:

```ts
// src/lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public campos?: Record<string, string>,
  ) {
    super(message);
  }
}

export async function parseErro(res: Response): Promise<never> {
  let corpo: Partial<ErroResponse> = {};
  try {
    corpo = await res.json();
  } catch {
    /* resposta sem corpo (ex.: 204 ou erro de rede) */
  }
  throw new ApiError(
    res.status,
    corpo.mensagem ?? "Erro ao comunicar com o servidor",
    corpo.campos,
  );
}
```

| Status | Significado                   | O que a UI faz                                                                                                     |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 400    | Validacao ou regra de negocio | Mostra `campos` nos inputs; senao, toast com `mensagem`                                                            |
| 401    | Token ausente/expirado        | Limpa a sessao e redireciona para `/login`                                                                         |
| 403    | Sem permissao                 | Toast; nao deveria acontecer se a UI esconder o que nao e do usuario                                               |
| 404    | Nao existe                    | Pagina `not-found`                                                                                                 |
| 409    | Duplicado                     | Mensagem especifica (nome em uso, ja avaliou, musica ja na playlist)                                               |
| 429    | Muitas tentativas de login    | Mostra a `mensagem` da API e uma contagem regressiva baseada em `Retry-After`; desabilita o login durante a espera |
| 500    | Erro no servidor              | Toast generico; nao exponha detalhes                                                                               |

Quando vier `400` com `campos`, mapeie direto para os erros do formulario:

```ts
if (err instanceof ApiError && err.campos) {
  for (const [campo, msg] of Object.entries(err.campos)) {
    form.setError(campo as keyof FormData, { message: msg });
  }
}
```

---

## 3. Autenticacao e seguranca

### O modelo

O backend emite um JWT valido por 24h (`expiraEmSegundos: 86400`). O subject do token e o id do
usuario; ele carrega tambem `email` e `tipo`.

**Regra central: o token nunca chega ao JavaScript do navegador.** Ele fica num cookie
`httpOnly`, e o browser conversa apenas com o servidor do Next, que repassa as chamadas para a
API.

```
navegador → Next (Server Action / Route Handler) → API Spring
            ↑ cookie httpOnly                      ↑ Authorization: Bearer
```

Por que nao `localStorage`: qualquer script injetado (XSS, dependencia comprometida, extensao)
le o `localStorage` e rouba o token. Cookie `httpOnly` nao e acessivel por JS.

### Cookie de sessao

```ts
// src/lib/auth/session.ts
import { cookies } from "next/headers";

const NOME_COOKIE = "soundhub_sessao";

export async function criarSessao(token: string, expiraEmSegundos: number) {
  const cookieStore = await cookies();
  cookieStore.set(NOME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // "lax" permite voltar de link externo; "strict" quebraria isso
    path: "/",
    maxAge: expiraEmSegundos,
  });
}

export async function lerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(NOME_COOKIE)?.value ?? null;
}

export async function destruirSessao() {
  const cookieStore = await cookies();
  cookieStore.delete(NOME_COOKIE);
}
```

### Cliente da API (servidor)

```ts
// src/lib/api/client.ts
import "server-only"; // garante que nunca vai para o bundle do cliente
import { lerToken } from "@/lib/auth/session";
import { parseErro } from "./errors";

const API_URL = process.env.API_URL!;

export async function apiFetch<T>(
  caminho: string,
  init: RequestInit & { next?: NextFetchRequestConfig } = {},
): Promise<T> {
  const token = await lerToken();

  const res = await fetch(`${API_URL}${caminho}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) await parseErro(res);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
```

O pacote `server-only` faz o build falhar se alguem importar esse arquivo num Client Component
— proteje contra vazar o token por descuido.

### Login com Server Action

```ts
// src/app/(auth)/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { criarSessao } from "@/lib/auth/session";
import { ApiError } from "@/lib/api/errors";
import type { TokenResponse } from "@/types/api";

export async function loginAction(
  _estadoAnterior: unknown,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  try {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) {
      const erro = await res.json().catch(() => ({}));
      return { erro: erro.mensagem ?? "Email ou senha invalidos" };
    }

    const dados: TokenResponse = await res.json();
    await criarSessao(dados.token, dados.expiraEmSegundos);
  } catch {
    return { erro: "Nao foi possivel conectar ao servidor" };
  }

  redirect("/playlists"); // fora do try: redirect lanca uma excecao de controle
}
```

> **Cuidado:** `redirect()` funciona lancando uma excecao interna do Next. Se ficar dentro do
> `try`, o `catch` a captura e o redirecionamento nao acontece. Sempre chame depois do bloco.

### Middleware

Protege as rotas antes de renderizar qualquer coisa:

```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const ROTAS_PUBLICAS = ["/login", "/registrar"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("soundhub_sessao")?.value;
  const ehPublica = ROTAS_PUBLICAS.some((r) => pathname.startsWith(r));

  if (!token && !ehPublica) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname); // volta pra ca depois do login
    return NextResponse.redirect(url);
  }

  if (token && ehPublica) {
    return NextResponse.redirect(new URL("/playlists", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)",
  ],
};
```

> **O middleware so checa se o cookie existe — ele nao valida a assinatura do token.** Isso e
> intencional: validar exigiria chamar a API a cada navegacao. A validacao real acontece quando
> a API responde `401`. Nunca trate a presenca do cookie como prova de autenticacao para decidir
> algo sensivel; a autorizacao de verdade e sempre do backend.

### Tratar 401 em qualquer lugar

```ts
// src/lib/api/guard.ts
import { redirect } from "next/navigation";
import { destruirSessao } from "@/lib/auth/session";
import { ApiError } from "./errors";

export async function comGuarda<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await destruirSessao();
      redirect("/login?expirado=1");
    }
    throw err;
  }
}
```

### Checklist de seguranca

- [ ] Token em cookie `httpOnly`, nunca em `localStorage` ou `sessionStorage`
- [ ] `secure: true` em producao
- [ ] `sameSite: "lax"` (protege contra CSRF na maioria dos casos)
- [ ] `API_URL` sem prefixo `NEXT_PUBLIC_`
- [ ] `server-only` no cliente da API
- [ ] `.env.local` no `.gitignore`; commitar so o `.env.example`
- [ ] Nunca renderizar `dangerouslySetInnerHTML` com texto vindo da API (comentarios de
      avaliacao sao texto livre de usuario)
- [ ] Esconder da UI acoes que o backend vai recusar (editar playlist alheia), mas **sem
      confiar nisso como seguranca** — a checagem real e no backend

---

## 4. Estrutura de pastas

```
soundhub-web/
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # <html lang="pt-BR">, fonte, providers
│   │   ├── globals.css                 # tokens de cor e Tailwind
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   │
│   │   ├── (auth)/                     # grupo sem sidebar
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── login-form.tsx      # "use client"
│   │   │   │   └── actions.ts          # "use server"
│   │   │   └── registrar/
│   │   │       ├── page.tsx
│   │   │       ├── registro-form.tsx
│   │   │       └── actions.ts
│   │   │
│   │   └── (app)/                      # grupo protegido, com sidebar
│   │       ├── layout.tsx
│   │       ├── playlists/
│   │       │   ├── page.tsx            # listagem
│   │       │   ├── loading.tsx         # skeleton
│   │       │   ├── actions.ts
│   │       │   ├── nova/page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx        # detalhe
│   │       │       ├── loading.tsx
│   │       │       └── editar/page.tsx
│   │       ├── descobrir/page.tsx      # busca de playlists publicas
│   │       ├── avaliacoes/page.tsx     # "/avaliacoes/minhas"
│   │       └── perfil/
│   │           ├── page.tsx
│   │           └── actions.ts
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn (gerado, nao editar a mao)
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── user-menu.tsx
│   │   ├── playlist/
│   │   │   ├── playlist-card.tsx
│   │   │   ├── playlist-form.tsx
│   │   │   ├── lista-musicas.tsx
│   │   │   └── badge-privacidade.tsx
│   │   ├── avaliacao/
│   │   │   ├── estrelas.tsx            # input e display
│   │   │   ├── avaliacao-card.tsx
│   │   │   └── resumo-media.tsx
│   │   └── comum/
│   │       ├── estado-vazio.tsx
│   │       ├── confirmar-dialog.tsx
│   │       └── mensagem-erro.tsx
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts               # apiFetch
│   │   │   ├── errors.ts               # ApiError, parseErro
│   │   │   ├── guard.ts                # comGuarda (401)
│   │   │   ├── playlists.ts            # funcoes por dominio
│   │   │   ├── avaliacoes.ts
│   │   │   └── usuarios.ts
│   │   ├── auth/
│   │   │   ├── session.ts
│   │   │   └── usuario-atual.ts
│   │   ├── schemas/                    # zod, espelhando a validacao do backend
│   │   │   ├── auth.ts
│   │   │   ├── playlist.ts
│   │   │   └── avaliacao.ts
│   │   └── utils/
│   │       ├── cn.ts                   # do shadcn
│   │       ├── formatar-duracao.ts     # 390 -> "6:30"
│   │       └── formatar-data.ts
│   │
│   ├── types/
│   │   └── api.ts
│   │
│   └── middleware.ts
└── public/
```

### Convencoes

- **Arquivos e pastas:** `kebab-case`. Componentes: `PascalCase`. Funcoes e variaveis:
  `camelCase`.
- **Server Component por padrao.** So marque `"use client"` no componente folha que realmente
  precisa de estado, evento ou hook. Um formulario vira client; a pagina que o contem, nao.
- **Uma funcao por endpoint** em `lib/api/<dominio>.ts`. Nenhum componente monta URL na mao.
- **Nomes em portugues** no dominio (`playlist`, `avaliacao`, `usuario`) para bater com a API;
  termos tecnicos em ingles seguem o padrao do Next (`layout`, `page`, `loading`).

Exemplo de modulo de dominio:

```ts
// src/lib/api/playlists.ts
import { apiFetch } from "./client";
import type { PlaylistResumo, PlaylistDetalhe } from "@/types/api";

export const listarPlaylists = () =>
  apiFetch<PlaylistResumo[]>("/playlists", { next: { tags: ["playlists"] } });

export const listarMinhasPlaylists = () =>
  apiFetch<PlaylistResumo[]>("/playlists/minhas", {
    next: { tags: ["playlists"] },
  });

export const buscarPlaylist = (id: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}`, {
    next: { tags: [`playlist-${id}`] },
  });

export const criarPlaylist = (dados: {
  nome: string;
  descricao?: string;
  publica?: boolean;
}) =>
  apiFetch<PlaylistDetalhe>("/playlists", {
    method: "POST",
    body: JSON.stringify(dados),
  });

export const adicionarMusica = (id: number, musicaId: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}/musicas`, {
    method: "POST",
    body: JSON.stringify({ musicaId }),
  });

export const removerMusica = (id: number, musicaId: number) =>
  apiFetch<PlaylistDetalhe>(`/playlists/${id}/musicas/${musicaId}`, {
    method: "DELETE",
  });
```

---

## 5. Identidade visual

### Direcao

SoundHub e um projeto academico da **UNESC**. A interface deve parecer um produto real de
streaming, nao um exercicio: densa de conteudo, escura, com hierarquia clara — e com a marca da
universidade presente de forma sobria, nao decorativa.

> **Sobre as cores da UNESC:** a identidade da universidade usa **dois tons de verde** — os tres
> pontos do simbolo representam Ensino, Pesquisa e Extensao, e o verde aponta para a questao
> ambiental. Os valores abaixo sao uma aproximacao para comecar. **Confirme os hex exatos no
> manual da marca** (Reitoria → Identidade Visual) e substitua os tokens; como tudo esta
> centralizado em variaveis CSS, e uma troca de poucos minutos.

### Tokens

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  /* Marca — dois verdes da UNESC (CONFIRMAR no manual) */
  --unesc-verde: #00913f; /* principal */
  --unesc-verde-claro: #8cc63f; /* secundario, acentos */

  /* Superficies — escuro, como plataforma de musica */
  --fundo: #0b0e0c;
  --superficie: #141815;
  --superficie-alta: #1e241f;
  --borda: #2a312c;

  /* Texto */
  --texto: #f2f5f3;
  --texto-suave: #a3ada6;
  --texto-fraco: #6b756e;

  /* Semanticas */
  --sucesso: #00913f;
  --erro: #e5484d;
  --aviso: #f5a524;
  --estrela: #f5a524;
}

@theme inline {
  --color-marca: var(--unesc-verde);
  --color-marca-clara: var(--unesc-verde-claro);
  --color-fundo: var(--fundo);
  --color-superficie: var(--superficie);
  --color-superficie-alta: var(--superficie-alta);
  --color-borda: var(--borda);
  --color-texto: var(--texto);
  --color-texto-suave: var(--texto-suave);

  --font-sans: Arial, Helvetica, sans-serif;
  --radius: 0.5rem;
}

body {
  background: var(--fundo);
  color: var(--texto);
  font-family: var(--font-sans);
}
```

### Tipografia

**Arial**, conforme definido. Sem `next/font` e sem Google Fonts — Arial e fonte de sistema,
entao carrega instantaneamente e nao gera requisicao nem CLS.

```ts
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

Escala (Tailwind): `text-3xl font-bold` titulo de pagina · `text-xl font-semibold` secao ·
`text-base` corpo · `text-sm text-texto-suave` metadados · `text-xs` labels.

Arial nao tem muitos pesos: use **regular (400)** e **bold (700)**. Hierarquia vem de tamanho,
cor e espacamento — nao de peso intermediario.

### Como nao parecer template de IA

Erros que denunciam interface gerada sem cuidado, e o que fazer:

| Evite                                       | Faca                                                        |
| ------------------------------------------- | ----------------------------------------------------------- |
| Gradiente roxo/rosa em heroi                | Fundo solido escuro; verde so em acao e destaque            |
| Emoji como icone (🎵 📀)                    | `lucide-react`, que ja vem com o shadcn                     |
| Tudo centralizado com `max-w-md`            | Layout real: sidebar fixa + conteudo fluido                 |
| `shadow-2xl` e bordas arredondadas gigantes | `border border-borda`, `rounded-lg`                         |
| Card generico repetido pra tudo             | Card de playlist ≠ item de musica ≠ card de avaliacao       |
| "Bem-vindo ao SoundHub! ✨"                 | "Suas playlists" · "12 musicas · 48 min"                    |
| Espaco vazio com texto centralizado         | Estado vazio com acao: "Crie sua primeira playlist" + botao |
| Animacao em tudo                            | Transicao so em hover e abertura de modal                   |

Referencias de layout: Spotify (sidebar, densidade), Linear (tipografia sobria), Bandcamp
(conteudo primeiro).

### Componentes shadcn a instalar

```bash
npx shadcn@latest add button input textarea label card dialog \
  dropdown-menu avatar badge skeleton sonner form select switch alert-dialog tabs
```

- `sonner` — toasts de feedback
- `alert-dialog` — confirmar exclusao (nunca deletar sem confirmacao)
- `skeleton` — estados de carregamento nos `loading.tsx`
- `form` — integra com react-hook-form + zod

### Marca da UNESC na interface

- Logo da UNESC no rodape da sidebar, discreto, com o texto "Projeto academico — UNESC".
- O logo do SoundHub e o produto; o da universidade e contexto. Nao competem.
- Pagina de login: logo do SoundHub centralizado, assinatura da UNESC embaixo em `text-xs
text-texto-fraco`.

### Acessibilidade (conta na nota de qualidade)

- Contraste minimo 4.5:1 para texto. Verifique `--texto-suave` sobre `--superficie`.
- Todo input com `<Label htmlFor>`.
- Botao so com icone precisa de `aria-label`.
- Foco visivel: nunca `outline: none` sem substituto.
- Estrelas de avaliacao: implemente com `<input type="radio">` visualmente escondido, para
  funcionar por teclado.

---

## 6. Cache e performance

O App Router tem quatro camadas de cache. Entender qual usar evita tanto dado velho quanto
requisicao desnecessaria.

### Regra por tipo de dado

| Dado                           | Estrategia                                   | Por que                                   |
| ------------------------------ | -------------------------------------------- | ----------------------------------------- |
| Playlists do usuario           | `tags: ["playlists"]` + revalidar na mutacao | Muda quando o usuario age                 |
| Detalhe da playlist            | `tags: ["playlist-{id}"]`                    | Invalidacao cirurgica                     |
| Playlists publicas (descobrir) | `revalidate: 60`                             | Tolera 1 min de atraso                    |
| Media de avaliacoes            | `revalidate: 30`                             | Muda conforme outros avaliam              |
| `/usuarios/me`                 | `cache: "no-store"`                          | Sessao; nunca compartilhar entre usuarios |
| Busca com query                | `cache: "no-store"`                          | Resultado por termo, cachear nao ajuda    |

> **Atencao — dado autenticado nunca vai para cache compartilhado.** Como toda chamada leva o
> token do usuario, cachear `/playlists/minhas` sem tag por usuario poderia entregar a playlist
> de um usuario para outro. Na duvida, `no-store`. Use cache com tags apenas quando a
> invalidacao acontece em toda mutacao, como no exemplo abaixo.

### Invalidar ao mutar

```ts
// src/app/(app)/playlists/actions.ts
"use server";

import { revalidateTag } from "next/cache";
import { criarPlaylist, adicionarMusica } from "@/lib/api/playlists";
import { ApiError } from "@/lib/api/errors";

export async function criarPlaylistAction(_prev: unknown, formData: FormData) {
  try {
    const playlist = await criarPlaylist({
      nome: String(formData.get("nome") ?? ""),
      descricao: String(formData.get("descricao") ?? "") || undefined,
      publica: formData.get("publica") === "on",
    });

    revalidateTag("playlists");
    return { ok: true as const, playlist };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false as const, erro: err.message, campos: err.campos };
    }
    return { ok: false as const, erro: "Erro inesperado" };
  }
}

export async function adicionarMusicaAction(
  playlistId: number,
  musicaId: number,
) {
  const atualizada = await adicionarMusica(playlistId, musicaId);
  revalidateTag(`playlist-${playlistId}`);
  revalidateTag("playlists"); // o contador de musicas mudou na listagem
  return atualizada;
}
```

### Ganhos rapidos

1. **`loading.tsx` em toda rota com dado.** Um arquivo de 10 linhas com `<Skeleton />` faz a
   navegacao parecer instantanea — e o melhor retorno por esforco de todo este documento.

2. **Requisicoes em paralelo.** Sequencial dobra o tempo:

   ```ts
   // ruim — espera uma pra comecar a outra
   const playlist = await buscarPlaylist(id);
   const media = await buscarMedia(musicaId);

   // bom
   const [playlist, media] = await Promise.all([
     buscarPlaylist(id),
     buscarMedia(musicaId),
   ]);
   ```

3. **Streaming com `<Suspense>`** para a parte lenta da pagina:

   ```tsx
   <PlaylistCabecalho playlist={playlist} />
   <Suspense fallback={<SkeletonMusicas />}>
     <ListaMusicas playlistId={playlist.id} />
   </Suspense>
   ```

4. **`useOptimistic`** ao remover musica — a linha some na hora, e volta se a API recusar.

5. **A resposta ja traz o estado novo.** Adicionar/remover musica retorna a playlist completa;
   use o retorno em vez de disparar outro GET.

6. **`next/image`** com `width`/`height` sempre definidos (evita layout shift).

7. **Debounce de 300ms** na busca, e `AbortController` para cancelar a requisicao anterior.

### Armadilhas

- **`revalidateTag` nao funciona em Client Component** — so em Server Action ou Route Handler.
- **`cookies()` torna a rota dinamica.** Como o `apiFetch` le cookie, toda pagina autenticada e
  dinamica; nao tente `generateStaticParams` nelas.
- **`router.refresh()` nao limpa o cache de `fetch`** — ele revalida o Router Cache do cliente.
  Para dado do servidor, use `revalidateTag`.
- **Paginacao:** a API ainda **nao** pagina nenhuma listagem. Com poucas centenas de registros
  esta ok, mas nao construa UI que dependa de `?page=`; se virar necessidade, peca ao backend.

---

## 7. Telas a construir

O trabalho exige "fluxo principal: login, CRUDs, listagens". Ordem sugerida — cada etapa entrega
algo funcionando:

### Etapa 1 — Autenticacao

- [ ] `/login` — email e senha, erro inline, link para registro
- [ ] `/registrar` — nome, email, senha, escolha OUVINTE/ARTISTA
- [ ] Middleware protegendo `(app)`
- [ ] Logout no menu do usuario

### Etapa 2 — Estrutura

- [ ] Layout com sidebar (Minhas playlists · Descobrir · Minhas avaliacoes · Perfil)
- [ ] Header com nome do usuario e badge do tipo
- [ ] `loading.tsx` e `error.tsx`

### Etapa 3 — Playlists (CRUD principal)

- [ ] `/playlists` — grid de cards, estado vazio com acao
- [ ] `/playlists/nova` — formulario com switch publica/privada
- [ ] `/playlists/[id]` — cabecalho + lista de musicas ordenada + duracao total
- [ ] `/playlists/[id]/editar`
- [ ] Excluir com `AlertDialog`
- [ ] Adicionar/remover musica (depende de Musica — ver secao 8)

### Etapa 4 — Avaliacoes

- [ ] Componente de estrelas (leitura e escrita)
- [ ] `/avaliacoes` — suas avaliacoes, editaveis
- [ ] Avaliar musica em modal, detectando `409` para alternar para edicao
- [ ] Resumo de media (`4.5 ★ · 12 avaliacoes`)

### Etapa 5 — Descobrir e perfil

- [ ] `/descobrir` — busca de playlists publicas com debounce
- [ ] `/perfil` — editar nome/email, alterar senha

### Etapa 6 — Acabamento

- [ ] Toasts de sucesso e erro
- [ ] Estados vazios em todas as listas
- [ ] Responsivo (sidebar vira drawer no mobile)
- [ ] Revisao de contraste e foco por teclado

---

## 8. Endpoints futuros

**Musica e Categoria** estao em desenvolvimento. Como Playlist e Avaliacao dependem de
Musica, o front precisa de uma estrategia para nao ficar bloqueado.

> **Artista e Album ja estao prontos** — os endpoints e os tipos estao na secao 2. Esta
> secao trata apenas do que ainda falta.

### O que ja da para saber

As entidades existem no banco com esta forma (definida nas migrations):

```ts
export interface Musica {
  id: number;
  titulo: string;
  duracao: number; // segundos
  artistaId: number;
  albumId: number | null;
}

export interface Categoria {
  id: number;
  nome: string;
}
```

Os endpoints provavelmente seguirao o mesmo padrao REST do resto da API (`GET /musicas`,
`GET /musicas/{id}`, `POST /musicas` restrito a ARTISTA, etc.), mas **confirme com o Douglas**
antes de integrar.

### Como trabalhar sem eles

Isole tudo que depende de musica em `src/lib/api/musicas.ts` com dados falsos e um interruptor:

```ts
// src/lib/api/musicas.ts
import { apiFetch } from "./client";
import type { Musica } from "@/types/api";

const USAR_MOCK = process.env.MOCK_MUSICAS === "true";

const MUSICAS_FALSAS: Musica[] = [
  { id: 1, titulo: "Musica Um", duracao: 210, artistaId: 1, albumId: null },
  { id: 2, titulo: "Musica Dois", duracao: 180, artistaId: 1, albumId: null },
];

export async function listarMusicas(): Promise<Musica[]> {
  if (USAR_MOCK) return MUSICAS_FALSAS;
  return apiFetch<Musica[]>("/musicas", { next: { revalidate: 300 } });
}
```

Com `MOCK_MUSICAS=true` no `.env.local`, voce constroi a tela de "adicionar musica a playlist"
hoje. Quando a API ficar pronta, remove a variavel — nenhum componente muda.

> **Importante:** `POST /playlists/{id}/musicas` **ja funciona hoje** — ele so precisa de um
> `musicaId` que exista no banco. Para testar de verdade antes dos endpoints ficarem prontos,
> insira algumas musicas direto no banco e use os ids reais.

### Telas a acrescentar depois

- `/musicas` — catalogo com filtro por categoria
- `/musicas/[id]` — detalhe, media de avaliacoes, botao "adicionar a playlist"
- `/artistas/[id]` — perfil com albuns e musicas (a API ja esta pronta, ver secao 2)
- Area do artista (so `tipo === "ARTISTA"`) para cadastrar album e musica

Deixe a sidebar preparada para esses itens, mesmo que desabilitados no inicio.

---

## 9. Checklist de entrega

Conferir antes de apresentar:

**Funcional**

- [ ] Login e registro funcionando, com erro tratado
- [ ] Rotas protegidas redirecionam para `/login`
- [ ] CRUD completo de playlist
- [ ] Adicionar e remover musica, com ordem correta
- [ ] CRUD de avaliacao, com estrelas e media
- [ ] Busca de playlists publicas
- [ ] Logout limpa a sessao

**Qualidade**

- [ ] `npm run build` sem erro e sem warning de TypeScript
- [ ] Nenhum `any` no codigo
- [ ] `loading.tsx` nas rotas com dado
- [ ] Estados vazios em todas as listas
- [ ] Responsivo em 375px, 768px e 1440px
- [ ] Nenhum `console.log` sobrando

**Seguranca**

- [ ] Token so em cookie `httpOnly`
- [ ] `API_URL` nao exposta no bundle (confira o DevTools → Sources)
- [ ] `.env.local` fora do git
- [ ] 401 desloga automaticamente

**Apresentacao**

- [ ] README do front com print das telas e instrucoes
- [ ] Seed de dados para a demo (usuarios, playlists e avaliacoes prontos)
- [ ] Roteiro da demo ensaiado: registrar → criar playlist → adicionar musica → avaliar

---

## Referencia rapida

|                 |                                                        |
| --------------- | ------------------------------------------------------ |
| API             | `http://localhost:8080`                                |
| Swagger         | `http://localhost:8080/swagger-ui.html`                |
| Front           | `http://localhost:3000`                                |
| Cookie          | `soundhub_sessao` (httpOnly)                           |
| Token           | JWT, 24h, header `Authorization: Bearer <token>`       |
| Origem liberada | `http://localhost:3000` (ajustavel por `CORS_ORIGENS`) |

Duvida sobre o comportamento de um endpoint: teste primeiro no Swagger. Ele mostra a resposta
real, incluindo os formatos de erro.
