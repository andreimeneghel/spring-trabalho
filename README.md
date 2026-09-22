# SoundHub

Plataforma de streaming de musica inspirada no Spotify, feita como Trabalho 1 da disciplina de
Desenvolvimento Backend com Spring Boot. Artistas publicam musicas e albuns; ouvintes escutam,
montam playlists e avaliam musicas.

Monorepositorio com duas aplicacoes:

```
spring-trabalho/
├── java/     API REST — Spring Boot 3, JWT, PostgreSQL, Flyway
└── front/    Interface web — Next.js 16, TypeScript, Tailwind, shadcn/ui
```

> **Vai mexer no codigo?** Leia o [AGENTS.md](AGENTS.md) antes: ele explica como o projeto
> esta montado, as decisoes ja tomadas e as regras que valem para toda alteracao (sempre
> testar, manter o [FRONTEND.md](FRONTEND.md) atualizado, encerrar as portas ao terminar).

---

## Equipe

| Integrante | Responsabilidade |
|---|---|
| Andrei de Jesus Meneghel | Usuario (cadastro, login) e autenticacao/autorizacao com JWT |
| Gustavo Bratti Inacio | Artista e Album |
| Douglas Barra | Musica e Categoria |
| Luiz Fellipe Rocha | Playlist e Avaliacao |

---

## Tecnologias

**Backend (`java/`)**

- Java 25
- Spring Boot 3.5.6 (Web, Data JPA, Security, Validation)
- PostgreSQL 16 + Flyway
- JWT (jjwt 0.12.6)
- Lombok
- Swagger / OpenAPI (springdoc)
- H2 em memoria (somente nos testes)

**Frontend (`front/`)**

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4 + shadcn/ui
- Zod (validacao espelhando a do backend)

---

## Como rodar

Sao tres passos: banco, API e front. A API precisa estar no ar antes do front.

### 1. Pre-requisitos

- JDK 25
- Node.js 20 ou superior
- Docker (para subir o Postgres) ou um PostgreSQL ja instalado na maquina

### 2. Subir o banco

```bash
docker compose up -d
```

Isso cria o banco `soundhub` (usuario `postgres`, senha `123`) na **porta 5437**.

> **Por que 5437 e nao 5432?** Muita gente ja tem um PostgreSQL instalado direto no Windows,
> ocupando a 5432 — e ai o container nao sobe. Usando a 5437 os dois convivem sem conflito. O
> container continua usando a 5432 internamente; quem muda e so a porta do host.

Se preferir usar um Postgres que ja esta instalado em vez do Docker, crie o banco `soundhub`
manualmente e ajuste as variaveis de ambiente:

```bash
export DB_URL=jdbc:postgresql://localhost:5432/soundhub   # a porta do SEU Postgres
export DB_USER=postgres
export DB_PASSWORD=suasenha
```

### 3. Rodar a API

```bash
cd java
./mvnw spring-boot:run
```

No Windows (PowerShell/CMD):

```
cd java
mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`. O Flyway cria e versiona as tabelas sozinho na primeira
execucao — nao e preciso rodar nenhum SQL na mao.

### 4. Rodar o front

Em outro terminal:

```bash
cd front
cp .env.example .env.local    # no Windows: copy .env.example .env.local
npm install
npm run dev
```

O front sobe em `http://localhost:3001`.

> Enquanto os endpoints de Musica nao existirem, deixe `MOCK_MUSICAS=true` no `.env.local`: a
> tela de adicionar musica usa um catalogo de exemplo. Troque para `false` quando a parte do
> Douglas estiver pronta.

### 5. Rodar os testes

```bash
cd java
./mvnw test
```

Os testes usam H2 em memoria, entao rodam sem precisar do Docker nem do Postgres.

### 6. Swagger

Com a API no ar: **http://localhost:8080/swagger-ui.html**

Para testar as rotas protegidas: faca login, copie o `token` da resposta, clique em
**Authorize** no topo da pagina e cole o token (sem escrever `Bearer `).

---

## Estrutura de pastas

### Backend — `java/`

Organizado **por modulo** (package-by-feature): cada entidade principal tem a sua pasta, e
dentro dela ficam as camadas. As camadas continuam separadas — Controller, Service, Repository,
Entity e DTO — so que agrupadas por assunto em vez de espalhadas pelo projeto.

```text
java/src/main/java/com/soundhub/
├── auth/                        # login e cadastro (Andrei)
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   └── dto/
├── usuario/                     # CRUD de usuario (Andrei)
│   └── controller/  service/  repository/  entity/  dto/
├── artista/                     # Artista e Album (Gustavo)
│   └── controller/  service/  repository/  entity/  dto/
├── musica/                      # Musica e Categoria (Douglas)
│   └── repository/  entity/
├── playlist/                    # Playlist (Luiz Fellipe)
│   ├── controller/PlaylistController.java
│   ├── service/PlaylistService.java
│   ├── repository/PlaylistRepository.java
│   ├── entity/Playlist.java, PlaylistMusica.java
│   └── dto/
├── avaliacao/                   # Avaliacao (Luiz Fellipe)
│   └── controller/  service/  repository/  entity/  dto/
└── common/                      # compartilhado por todos os modulos
    ├── config/                  # SecurityConfig, OpenApiConfig
    ├── exception/               # GlobalExceptionHandler e as excecoes
    ├── security/                # filtro JWT, JwtService, UserDetailsService
    └── util/

java/src/main/resources/
├── application.yml
└── db/migration/                # migrations do Flyway
    ├── V1__create_usuario.sql
    ├── V2__create_artista_album_musica_categoria.sql
    ├── V3__create_playlist_avaliacao.sql
    ├── V4__add_foto_usuario.sql
    └── V5__add_capa_playlist.sql
```

Duas observacoes sobre a estrutura:

- **`auth/` nao tem `entity/` nem `repository/`** porque autenticacao nao tem tabela propria:
  nao existe uma entidade `Auth` para persistir. O `AuthService` trabalha em cima de `Usuario`
  e usa o `UsuarioRepository`, que ficam no modulo `usuario/`. Criar um repositorio proprio ali
  seria duplicar o acesso a mesma tabela.
- **`musica/` ainda so tem `entity/` e `repository/`.** Essas entidades foram criadas na
  versao minima porque Playlist e Avaliacao dependem delas para compilar; o CRUD completo
  fica com o Douglas, e as pastas ja estao reservadas. O modulo `artista/` ja esta completo.

### Frontend — `front/`

```text
front/src/
├── app/
│   ├── (auth)/                  # login e registro (sem sidebar)
│   │   ├── login/
│   │   └── registrar/
│   ├── (app)/                   # area logada (com sidebar)
│   │   ├── playlists/           # listagem, nova, [id], [id]/editar
│   │   ├── descobrir/           # busca de playlists publicas
│   │   ├── avaliacoes/          # minhas avaliacoes
│   │   └── perfil/
│   ├── layout.tsx
│   ├── globals.css              # tokens de cor (verde UNESC) e tema escuro
│   ├── not-found.tsx
│   └── error.tsx
├── components/
│   ├── ui/                      # shadcn/ui
│   ├── layout/                  # sidebar, menu do usuario
│   ├── playlist/                # card, form, lista de musicas, dialogs
│   ├── avaliacao/               # estrelas, card de avaliacao
│   └── comum/                   # logo, estado vazio, cabecalho
├── lib/
│   ├── api/                     # client, errors, guard + um modulo por dominio
│   ├── auth/                    # sessao (cookie httpOnly) e server actions
│   ├── schemas/                 # zod, espelhando a validacao do backend
│   └── utils/                   # formatacao de duracao, data, contagens
├── types/api.ts                 # espelho dos DTOs do backend
└── proxy.ts                     # protege as rotas (era middleware.ts)
```

O detalhamento do front — contrato da API, decisoes de cache, identidade visual e checklist —
esta em [FRONTEND.md](FRONTEND.md).

---

## Modelo de dados

| Relacionamento | Tipo |
|---|---|
| Usuario → Artista | 1:1 |
| Artista → Album | 1:N |
| Artista → Musica | 1:N |
| Album → Musica | 1:N |
| Usuario → Playlist | 1:N |
| Usuario → Avaliacao | 1:N |
| Musica → Avaliacao | 1:N |
| Playlist ↔ Musica | N:N (`playlist_musica`, com a coluna `ordem`) |
| Musica ↔ Categoria | N:N (`musica_categoria`) |

Restricoes de integridade que valem destacar:

- `uk_playlist_usuario_nome` — o mesmo usuario nao pode ter duas playlists com o mesmo nome.
- `uk_avaliacao_usuario_musica` — cada usuario avalia uma musica uma unica vez.
- `ck_avaliacao_nota` — a nota so aceita valores de 1 a 5.

---

## Autenticacao

Todas as rotas exigem token JWT, com excecao de `/auth/**` e do Swagger.

O token e devolvido no cadastro e no login, e deve ser enviado no header:

```
Authorization: Bearer <token>
```

Existem dois tipos de usuario: `OUVINTE` e `ARTISTA`. Ambos podem criar playlists e avaliar
musicas; apenas o `ARTISTA` pode cadastrar albuns e musicas.

---

## Endpoints

### Autenticacao — publico

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/auth/registrar` | Cadastra usuario e ja devolve o token |
| POST | `/auth/login` | Faz login e devolve o token |

### Usuario

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/usuarios` | Lista os usuarios |
| GET | `/usuarios/me` | Dados do usuario logado |
| GET | `/usuarios/{id}` | Busca por id |
| PUT | `/usuarios/{id}` | Atualiza nome e email (so a propria conta) |
| PATCH | `/usuarios/{id}/senha` | Altera a senha (so a propria conta) |
| DELETE | `/usuarios/{id}` | Exclui a conta (so a propria conta) |

### Playlist

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/playlists` | Playlists publicas + as suas proprias |
| GET | `/playlists/minhas` | Todas as suas, inclusive as privadas |
| GET | `/playlists/usuario/{usuarioId}` | Playlists de um usuario |
| GET | `/playlists/busca?nome=rock` | Busca playlists publicas pelo nome |
| GET | `/playlists/{id}` | Detalhe com as musicas, na ordem |
| POST | `/playlists` | Cria playlist |
| PUT | `/playlists/{id}` | Atualiza (so o dono) |
| DELETE | `/playlists/{id}` | Exclui (so o dono) |
| POST | `/playlists/{id}/musicas` | Adiciona musica no fim (so o dono) |
| DELETE | `/playlists/{id}/musicas/{musicaId}` | Remove musica (so o dono) |

### Artista

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/artistas` | Lista os artistas |
| GET | `/artistas/busca?nome=banda` | Busca pelo nome artistico |
| GET | `/artistas/meu-perfil` | Seu perfil de artista (404 se nao tiver) |
| GET | `/artistas/{id}` | Detalhe com as contagens e os albuns |
| POST | `/artistas` | Cria o seu perfil de artista (so ARTISTA) |
| PUT | `/artistas/{id}` | Atualiza (so ARTISTA e so o dono) |
| DELETE | `/artistas/{id}` | Exclui (so o dono, e so se nao tiver album nem musica) |

### Album

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/albuns` | Lista os albuns |
| GET | `/albuns/busca?titulo=raizes` | Busca pelo titulo |
| GET | `/albuns/artista/{artistaId}` | Albuns de um artista, mais recentes primeiro |
| GET | `/albuns/{id}` | Detalhe com a quantidade de musicas |
| POST | `/albuns` | Cria album no seu perfil de artista (so ARTISTA) |
| PUT | `/albuns/{id}` | Atualiza (so o artista dono) |
| DELETE | `/albuns/{id}` | Exclui (so o artista dono; as musicas ficam sem album) |

### Avaliacao

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/musicas/{musicaId}/avaliacoes` | Avaliacoes de uma musica |
| GET | `/musicas/{musicaId}/avaliacoes/media` | Media das notas e total |
| POST | `/musicas/{musicaId}/avaliacoes` | Avalia a musica (1 por usuario) |
| GET | `/avaliacoes/minhas` | Avaliacoes que voce fez |
| GET | `/avaliacoes/{id}` | Busca por id |
| PUT | `/avaliacoes/{id}` | Altera nota/comentario (so o autor) |
| DELETE | `/avaliacoes/{id}` | Exclui (so o autor) |

---

## Exemplos de requests e responses

### Cadastro

```http
POST /auth/registrar
Content-Type: application/json

{
  "nome": "Luiz Fellipe",
  "email": "luiz@soundhub.com",
  "senha": "senha123",
  "tipo": "OUVINTE"
}
```

**201 Created**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tipo": "Bearer",
  "expiraEmSegundos": 86400,
  "usuario": {
    "id": 1,
    "nome": "Luiz Fellipe",
    "email": "luiz@soundhub.com",
    "tipo": "OUVINTE"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "luiz@soundhub.com",
  "senha": "senha123"
}
```

**200 OK** — mesma resposta do cadastro.

### Criar playlist

```http
POST /playlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "nome": "Favoritas",
  "descricao": "as que eu mais ouço",
  "publica": true
}
```

**201 Created**

```json
{
  "id": 1,
  "nome": "Favoritas",
  "descricao": "as que eu mais ouço",
  "publica": true,
  "criadaEm": "2026-09-22T10:15:30",
  "donoId": 1,
  "donoNome": "Luiz Fellipe",
  "totalMusicas": 0,
  "duracaoTotal": 0,
  "musicas": []
}
```

### Adicionar musica na playlist

```http
POST /playlists/1/musicas
Authorization: Bearer <token>
Content-Type: application/json

{
  "musicaId": 3
}
```

**200 OK**

```json
{
  "id": 1,
  "nome": "Favoritas",
  "publica": true,
  "totalMusicas": 1,
  "duracaoTotal": 210,
  "musicas": [
    {
      "musicaId": 3,
      "titulo": "Musica Um",
      "duracao": 210,
      "artista": "Banda Teste",
      "ordem": 0
    }
  ]
}
```

### Criar perfil de artista

```http
POST /artistas
Authorization: Bearer <token>
Content-Type: application/json

{
  "nomeArtistico": "Banda do Morro",
  "biografia": "banda de rock de Criciuma"
}
```

**201 Created**

```json
{
  "id": 1,
  "nomeArtistico": "Banda do Morro",
  "biografia": "banda de rock de Criciuma",
  "usuarioId": 3,
  "usuarioNome": "Gustavo",
  "totalAlbuns": 0,
  "totalMusicas": 0,
  "albuns": []
}
```

Precisa ser um usuario `tipo: "ARTISTA"` (senao **403**) e que ainda nao tenha perfil
(senao **409**).

### Criar album

```http
POST /albuns
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Raizes",
  "anoLancamento": 2024
}
```

**201 Created**

```json
{
  "id": 1,
  "titulo": "Raizes",
  "anoLancamento": 2024,
  "artistaId": 1,
  "artistaNome": "Banda do Morro",
  "totalMusicas": 0
}
```

O album nao recebe `artistaId`: ele e sempre criado no perfil de artista de quem esta
logado. Sem perfil, volta **400**.

### Avaliar uma musica

```http
POST /musicas/3/avaliacoes
Authorization: Bearer <token>
Content-Type: application/json

{
  "nota": 5,
  "comentario": "musica muito boa"
}
```

**201 Created**

```json
{
  "id": 1,
  "nota": 5,
  "comentario": "musica muito boa",
  "criadaEm": "2026-09-22T10:20:00",
  "atualizadaEm": null,
  "usuarioId": 1,
  "usuarioNome": "Luiz Fellipe",
  "musicaId": 3,
  "musicaTitulo": "Musica Um"
}
```

### Media das notas

```http
GET /musicas/3/avaliacoes/media
Authorization: Bearer <token>
```

**200 OK**

```json
{
  "musicaId": 3,
  "musicaTitulo": "Musica Um",
  "media": 4.5,
  "totalAvaliacoes": 2
}
```

---

## Tratamento de erros

Todo erro da API volta no mesmo formato, montado pelo `GlobalExceptionHandler`
(`@RestControllerAdvice`).

### Erro de validacao — 400

```json
{
  "timestamp": "2026-09-22T10:30:00",
  "status": 400,
  "erro": "Erro de validacao",
  "mensagem": "Um ou mais campos estao invalidos",
  "caminho": "/musicas/3/avaliacoes",
  "campos": {
    "nota": "A nota maxima e 5"
  }
}
```

### Recurso nao encontrado — 404

```json
{
  "timestamp": "2026-09-22T10:31:00",
  "status": 404,
  "erro": "Not Found",
  "mensagem": "Playlist com id 99 nao encontrado(a)",
  "caminho": "/playlists/99"
}
```

### Conflito — 409

```json
{
  "timestamp": "2026-09-22T10:32:00",
  "status": 409,
  "erro": "Conflict",
  "mensagem": "Voce ja avaliou esta musica. Use PUT para alterar a sua avaliacao",
  "caminho": "/musicas/3/avaliacoes"
}
```

| Status | Quando acontece |
|---|---|
| 400 | Campo invalido, JSON mal formado ou regra de negocio quebrada |
| 401 | Token ausente, invalido ou expirado; email/senha errados |
| 403 | Tentou alterar algo de outro usuario, ou abrir playlist privada alheia |
| 404 | Id inexistente |
| 409 | Dado duplicado (email, nome de playlist, avaliacao repetida) |
| 429 | Muitas tentativas de login seguidas |
| 500 | Erro inesperado |

---

## Credenciais

O banco nao vem com usuario pre-cadastrado — o primeiro usuario e criado pelo
`POST /auth/registrar`.

Sugestao para testar os dois perfis:

| Tipo | Email | Senha |
|---|---|---|
| OUVINTE | ouvinte@soundhub.com | senha123 |
| ARTISTA | artista@soundhub.com | senha123 |

**Banco de dados (desenvolvimento):**

| | |
|---|---|
| Host | localhost:5437 |
| Banco | soundhub |
| Usuario | postgres |
| Senha | 123 |

**Limite de tentativas no login:** apos 3 senhas erradas seguidas para o mesmo email, novas
tentativas voltam `429` por 60 segundos. Protege contra forca bruta. Um login correto zera a
contagem. O controle e feito em memoria (`TentativaLoginService`) — numa aplicacao com varias
instancias isso precisaria ir para Redis.

As senhas dos usuarios sao gravadas com hash BCrypt — nunca em texto puro. A chave do JWT e as
credenciais do banco podem ser trocadas pelas variaveis de ambiente `JWT_SECRET`, `DB_URL`,
`DB_USER` e `DB_PASSWORD`.

**Como o front guarda a sessao:** o token JWT fica num cookie `httpOnly` chamado
`soundhub_sessao`. O JavaScript da pagina nunca enxerga esse token — quem conversa com a API e
o servidor do Next, que repassa as chamadas com o header `Authorization`. Isso evita que um XSS
consiga roubar a sessao, o que aconteceria se o token ficasse no `localStorage`.

---

## Observacoes sobre a modelagem

**Por que `PlaylistMusica` e uma entidade, e nao um `@ManyToMany` simples:** a tabela de
ligacao guarda dados proprios (a ordem da musica na playlist e a data em que foi adicionada),
e isso nao cabe num `@ManyToMany` puro. Ao remover uma musica do meio da playlist, a ordem e
refeita para nao ficar com buracos na numeracao.

**Playlist privada:** a playlist tem a flag `publica`. Quando esta `false`, so o dono consegue
abrir e ela nao aparece nas listagens dos outros usuarios.

**Avaliacao:** cada usuario avalia uma musica uma unica vez — para mudar de ideia, usa-se o
`PUT`, que atualiza a nota e preenche o campo `atualizadaEm`. Um artista nao pode avaliar a
propria musica.
