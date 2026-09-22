# AGENTS.md — guia para quem for codar neste repositório

Leia este arquivo antes de mexer em qualquer coisa. Ele descreve como o projeto está
montado, as decisões que já foram tomadas (e por quê), e as regras que valem para toda
alteração.

> **Se você é um agente de IA:** as três regras da seção
> [Regras obrigatórias](#regras-obrigatórias) não são sugestões. Sempre testar, sempre
> atualizar o `FRONTEND.md` e sempre encerrar as portas.

---

## O que é o projeto

SoundHub — plataforma de streaming de música, trabalho acadêmico da UNESC. Monorepositório
com duas aplicações:

```
spring-trabalho/
├── java/              API REST — Spring Boot 3, JWT, PostgreSQL, Flyway
├── front/             Interface web — Next.js 16, TypeScript, Tailwind, shadcn/ui
├── docker-compose.yml Postgres do projeto (porta 5437)
├── README.md          Documentação geral, endpoints, como rodar
├── FRONTEND.md        Contrato da API para o front — MANTER ATUALIZADO
└── AGENTS.md          Este arquivo
```

### Divisão do trabalho na equipe

| Integrante | Módulo | Estado |
|---|---|---|
| Andrei | `usuario/`, `auth/` | pronto |
| Gustavo | `artista/` (Artista, Album)  |
| Douglas | `musica/` (Musica, Categoria) |
| Luiz Fellipe | `playlist/`, `avaliacao/` | pronto, com testes |

**Importante:** `artista/` e `musica/` têm apenas entity e repository porque Playlist e
Avaliação dependem deles para compilar. O CRUD completo é responsabilidade do Gustavo e do
Douglas — as pastas `controller/`, `service/` e `dto/` já estão reservadas com um
`LEIA-ME.md` dentro. **Não implemente a parte deles sem combinar antes.**

---

## Regras obrigatórias

### 1. Sempre testar antes de dizer que está pronto

Nunca conclua uma tarefa sem executar. Compilar não é testar.

**Backend:**

```bash
cd java
./mvnw test                    # 12 testes; usa H2, não precisa de Docker
./mvnw spring-boot:run         # sobe de verdade contra o Postgres
```

Para exercitar um endpoint novo, use `curl` e confira **todos** os caminhos: sucesso, 400
de validação, 403 de permissão, 404, 409 de duplicidade. Erro só no caminho feliz é um
teste incompleto.

**Frontend:**

```bash
cd front
npx tsc --noEmit    # tipos
npm run lint        # lint
npm run build       # build de produção
npm run dev         # sobe e ABRE no navegador para ver
```

O `build` passar não significa que a tela funciona. Suba o front com a API no ar e
percorra o fluxo: login → criar playlist → adicionar música → avaliar.

> Já aconteceu de um switch parecer pronto (compilava, sem erro de lint) e **não funcionar
> na tela** — os seletores CSS não casavam com o que o Radix emite. Só apareceu ao clicar.

### 2. Sempre atualizar o `FRONTEND.md`

O `FRONTEND.md` é o contrato entre backend e frontend. **Toda alteração no backend que o
front precisa conhecer tem que ser refletida lá, na mesma tarefa.** Não deixe para depois.

Atualize o `FRONTEND.md` quando:

| Mudança no backend | O que atualizar no FRONTEND.md |
|---|---|
| Endpoint novo | tabela de endpoints da seção 2, com método, rota, body e resposta |
| Campo novo num DTO | o `interface` TypeScript correspondente na seção 2 |
| Campo renomeado ou removido | o `interface` **e** avisar que é breaking change |
| Regra de validação nova | a lista "Regras que o front precisa respeitar" |
| Novo código de erro (409, 422…) | a tabela de tratamento de erros |
| Mudança em autenticação/permissão | seção 3 |
| Entidade nova com tela | seção 7 (telas) e seção 8 (endpoints futuros) |

Quando o backend ganhar algo que exige trabalho no front, **escreva explicitamente o que o
front deve fazer**. Exemplo real, de quando a foto de perfil foi adicionada:

> `PUT /usuarios/{id}/foto` aceita `{ foto: string }` como data URI base64 (PNG ou JPG, até
> 2MB). O front deve: ler o arquivo com `FileReader.readAsDataURL`, validar tipo e tamanho
> antes de enviar, mostrar prévia otimista e reverter se a API recusar. `DELETE` na mesma
> rota remove. O campo `foto` entra no `interface Usuario` como `string | null`.

Se o `FRONTEND.md` divergir do código, registre a divergência no topo do arquivo (já há uma
seção assim explicando `proxy.ts` e a estratégia de cache).

### 3. Sempre encerrar as portas depois de testar

Ao terminar, mate os processos das portas **8080** (API) e **3001** (front):

```bash
netstat -ano | grep -E ":(3001|8080).*LISTENING"
taskkill //F //PID <pid>
```

O container do Postgres (`soundhub-db`) pode ficar de pé.

**Por quê:** processos órfãos ocupam a porta, o Next pula para 3002/3003 sozinho, e a API
falha com "Port 8080 was already in use". Já aconteceu de o `mvnw spring-boot:run` do
usuário quebrar por causa de uma API esquecida em background.

---

## Portas

Esta máquina tem outros serviços rodando. Use exatamente estas portas:

| Porta | Quem usa |
|---|---|
| 5432 | PostgreSQL nativo do Windows — **não é do projeto**, senha desconhecida |
| 5433 | container `postgres_db` de outro projeto |
| 3000 | container `nest_backend` de outro projeto |
| **5437** | **Postgres do SoundHub** (`soundhub-db`, mapeado 5437:5432) |
| **8080** | **API Spring** |
| **3001** | **front Next** (fixo no `package.json`: `next dev -p 3001`) |

A 3001 está liberada no CORS da API e no `allowedDevOrigins` do `next.config.ts`, junto com
`127.0.0.1`, `192.168.99.20` e `192.168.99.21` (acesso pela rede local). **Se mudar a porta
do front, mude nos dois lugares** — senão o navegador bloqueia as requisições.

Acessar o banco pelo pgAdmin: host `localhost`, porta **5437**, banco `soundhub`, usuário
`postgres`, senha `123`.

---

## Backend (`java/`)

### Ambiente

- **JDK 25 obrigatório.** Lombok 1.18.48 é a primeira versão que processa Java 25; versões
  anteriores falham silenciosamente e você vê erros de "cannot find symbol getNome()".
- O `pom.xml` declara o Lombok explicitamente como `annotationProcessorPaths` com
  `<proc>full</proc>`. **Não remova isso** — sem ele o Lombok não roda no Java 25.
- Use o wrapper (`./mvnw`), não um Maven global.

```bash
export JAVA_HOME="/c/Program Files/Java/jdk-25.0.4.1"   # Git Bash
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.4.1"   # PowerShell
```

### Estrutura: por módulo, com camadas dentro

Cada entidade tem sua pasta, e dentro dela as camadas separadas:

```
java/src/main/java/com/soundhub/
├── auth/         controller/  service/  dto/
├── usuario/      controller/  service/  repository/  entity/  dto/
├── artista/      entity/                      (Gustavo)
├── musica/       repository/  entity/         (Douglas)
├── playlist/     controller/  service/  repository/  entity/  dto/
├── avaliacao/    controller/  service/  repository/  entity/  dto/
└── common/       config/  exception/  security/  util/
```

Duas coisas que costumam gerar dúvida:

- **`auth/` não tem `entity/` nem `repository/`** porque autenticação não tem tabela
  própria. O `AuthService` usa `Usuario` e `UsuarioRepository`, do módulo `usuario/`.
- **Código compartilhado por dois módulos vai para `common/`.** Foi o caso do
  `EmailUtils.normalizar()`: estava no `AuthService`, mas o `UsuarioService` também
  precisava. Deixar lá criaria dependência circular entre os módulos.

### Padrões a seguir

Olhe um módulo pronto (`playlist/` ou `avaliacao/`) antes de escrever código novo. O padrão:

- **Controller** — fino. Só recebe, delega ao service e devolve `ResponseEntity`. Anotado
  com `@Tag`, `@Operation` (Swagger) e `@SecurityRequirement(name = "bearerAuth")`.
- **Service** — toda a lógica de negócio e as validações de permissão. `@Transactional`
  (com `readOnly = true` nas leituras). Lança as exceções de `common/exception/`.
- **Repository** — interface `JpaRepository`. Query methods ou `@Query` com JPQL.
- **Entity** — Lombok (`@Getter @Setter @Builder @EqualsAndHashCode(of = "id")`).
  Relações `LAZY` por padrão.
- **DTO** — `record`. Request com Bean Validation (`@NotBlank`, `@Size`...), response com
  um método estático `from(entidade)`. **Nunca exponha a entidade direto.**

Exceções disponíveis em `common/exception/`:

| Exceção | HTTP | Quando |
|---|---|---|
| `RecursoNaoEncontradoException` | 404 | id não existe |
| `RegraNegocioException` | 400 | regra de negócio quebrada |
| `ConflitoException` | 409 | duplicidade |
| `AccessDeniedException` (Spring) | 403 | não é o dono |

O `GlobalExceptionHandler` converte todas para o formato único `ErroResponseDTO`. Erros de
validação vêm com o mapa `campos`, que o front usa para marcar o input errado.

### Banco: Flyway, nunca `ddl-auto`

`spring.jpa.hibernate.ddl-auto=validate`. **O Hibernate nunca cria nem altera tabela.**

Para mudar o schema, crie uma migration nova — nunca edite uma já aplicada:

```
V1__create_usuario.sql
V2__create_artista_album_musica_categoria.sql
V3__create_playlist_avaliacao.sql
V4__add_foto_usuario.sql
V5__sua_mudanca_aqui.sql      ← próxima
```

Depois de criar a migration, rode `./mvnw test`: o `validate` compara o mapeamento das
entidades com o schema e falha se divergirem.

### Testes

`PlaylistAvaliacaoIntegrationTest` tem 11 testes cobrindo ordem das músicas, reordenação ao
remover do meio, permissões, duplicidade e cálculo de média. Roda com H2 em memória
(`application-test.yml`), então não precisa de Docker.

**Ao adicionar lógica de negócio, adicione teste.** Use esse arquivo como modelo.

---

## Frontend (`front/`)

Leia o **[FRONTEND.md](FRONTEND.md)** — ele tem o contrato completo da API, os tipos
TypeScript, a estratégia de cache e a identidade visual.

### Estrutura

```
front/src/
├── app/
│   ├── (auth)/          login, registrar — layout com foto de fundo
│   ├── (app)/           área logada — sidebar + header
│   ├── layout.tsx       TemaProvider, Toaster, metadata
│   └── globals.css      tokens de cor (tema claro e escuro)
├── components/
│   ├── ui/              shadcn — gerado, evite editar à mão
│   ├── layout/          sidebar, header, menu do usuário
│   ├── playlist/ avaliacao/ comum/
├── lib/
│   ├── api/             client, errors, guard + um módulo por domínio
│   ├── auth/            sessão (cookie httpOnly) e server actions
│   ├── schemas/         zod, espelhando a validação do backend
│   └── utils/
├── types/api.ts         espelho dos DTOs do backend
└── proxy.ts             protege as rotas (no Next 16 substitui middleware.ts)
```

### Regras do front

**Autenticação — o token nunca chega ao JavaScript.** Fica num cookie `httpOnly`
(`soundhub_sessao`). O navegador fala só com o servidor do Next, que repassa à API com o
header `Authorization`. Nunca use `localStorage` para o token, e nunca prefixe a URL da API
com `NEXT_PUBLIC_`.

**Cache: dado autenticado usa `cache: "no-store"`.** Como toda chamada leva o token do
usuário, cachear com tag global entregaria a playlist de um usuário para outro. A
invalidação depois de mutação é feita com `revalidatePath`.

**Server Component por padrão.** Só marque `"use client"` no componente folha que precisa de
estado ou evento. Uma página que contém um formulário continua sendo server.

**Uma função por endpoint** em `lib/api/<dominio>.ts`. Nenhum componente monta URL na mão.

**Ao mudar um DTO no backend, atualize `types/api.ts`** — ele é o espelho manual dos DTOs, e
nada avisa quando desincroniza.

### Armadilhas já encontradas

Coisas que quebraram de verdade neste projeto:

- **Switch do Radix não entra no `FormData`.** Ele renderiza um `<button>`, não um `<input>`.
  Foi preciso controlar por `useState` + `<input type="hidden">`. Sem isso, toda playlist
  saía privada.
- **Seletor errado deixa o componente mudo.** O Radix emite `data-state="checked"`, não
  `data-checked`. Com o seletor errado o switch compilava e não mudava de cor nem movia.
- **`redirect()` dentro de `try/catch` não funciona.** Ele lança uma exceção de controle que
  o `catch` engole. Chame sempre depois do bloco.
- **`Image` do Next com JPG "transparente"** — JPG não tem canal alpha. Se a logo vier com
  xadrez cinza, é porque a transparência foi achatada; peça um PNG.
- **Verde-limão (`--unesc-verde-claro`) some no tema claro.** Use
  `text-marca dark:text-marca-clara` em vez de `text-marca-clara` sozinho.
- **Erro de hidratação com `inmaintabuse`** vem de extensão do navegador, não do código. Já
  tratado com `suppressHydrationWarning` no `<html>` e `<body>`.

### Texto em português

Todo texto visível é acentuado corretamente. Ao escrever texto novo, acentue.

**Cuidado ao fazer substituição em massa:** acentuar com regex já quebrou o build deste
projeto duas vezes, porque pegou identificadores (`const avaliações`), nomes de prop
(`título=`) e valores de atributo (`name="descrição"`, que quebra o formulário em silêncio).
Se for mexer em muitos textos, **faça arquivo por arquivo** e rode `npx tsc --noEmit` depois.

---

## Fluxo para uma tarefa típica

Exemplo: "adicionar campo X na entidade Y, com endpoint".

1. **Migration** — `V<n>__add_x_em_y.sql`. Nunca edite migration já aplicada.
2. **Entity** — campo novo com a anotação de coluna certa.
3. **DTO** — request com validação, response com o campo novo.
4. **Service** — a lógica, incluindo a checagem de permissão.
5. **Controller** — endpoint com `@Operation` para o Swagger.
6. **`./mvnw test`** — confirma que o schema valida.
7. **Testar com `curl`** — sucesso, validação, permissão, 404.
8. **`FRONTEND.md`** — endpoint na tabela, campo no `interface`, o que o front deve fazer.
9. **Front** — `types/api.ts`, `lib/api/<dominio>.ts`, action, componente.
10. **`npx tsc --noEmit && npm run lint && npm run build`**.
11. **Subir e testar na tela.**
12. **Matar as portas 8080 e 3001.**

---

## Comandos

```bash
# Banco (uma vez)
docker compose up -d

# Backend
cd java
./mvnw spring-boot:run                 # API em :8080
./mvnw test                            # testes (H2, sem Docker)
./mvnw clean compile

# Frontend
cd front
npm run dev                            # :3001
npm run build
npm run lint
npx tsc --noEmit

# Banco pelo terminal
docker exec -it soundhub-db psql -U postgres -d soundhub

# Encerrar as portas (SEMPRE ao terminar)
netstat -ano | grep -E ":(3001|8080).*LISTENING"
taskkill //F //PID <pid>
```

Swagger com todos os endpoints: `http://localhost:8080/swagger-ui.html`

---

## Antes de entregar

- [ ] `./mvnw test` passando
- [ ] `npx tsc --noEmit`, `npm run lint` e `npm run build` limpos
- [ ] Fluxo testado na tela com a API no ar
- [ ] `FRONTEND.md` atualizado se o backend mudou
- [ ] `README.md` atualizado se mudou como rodar
- [ ] Portas 8080 e 3001 encerradas
- [ ] Nenhum `console.log` ou `System.out.println` sobrando
- [ ] `.env.local` fora do git
