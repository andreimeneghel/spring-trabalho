# SoundHub — Entrega 3: JWT + Spring Security

Branch **`security`**, com a parte de **autenticação e autorização** do SoundHub isolada do
resto do projeto.

> A aplicação completa (playlists, avaliações, artistas, álbuns e o frontend em Next.js) está
> na branch **`main`**. Esta branch contém apenas o que a Aula 10 pede: JWT, Spring Security,
> o CRUD de usuário e o tratamento de erros.

**Responsável pelo módulo:** Andrei de Jesus Meneghel (Usuario e autenticação/autorização)

---

## O que está implementado

| Item | Onde |
|---|---|
| Geração e validação de JWT | `common/security/JwtService.java` |
| Filtro que lê o token a cada requisição | `common/security/JwtAuthenticationFilter.java` |
| Regras de acesso e rotas públicas | `common/config/SecurityConfig.java` |
| Carregamento do usuário para o Spring Security | `common/security/UsuarioDetailsService.java` |
| Erros 401 e 403 no formato padrão da API | `common/security/SecurityErrorHandler.java` |
| Cadastro e login | `auth/` |
| Limite de tentativas de senha | `auth/service/TentativaLoginService.java` |
| CRUD de usuário protegido | `usuario/` |
| Tratamento centralizado de exceções | `common/exception/GlobalExceptionHandler.java` |

---

## Como rodar

### 1. Pré-requisitos

- **JDK 25** (o Lombok 1.18.48 é a primeira versão que processa Java 25)
- Docker, ou um PostgreSQL já instalado

### 2. Subir o banco

```bash
docker compose up -d
```

Cria o banco `soundhub` (usuário `postgres`, senha `123`) na **porta 5437**.

> A porta 5437 evita conflito com um PostgreSQL já instalado na máquina, que costuma ocupar
> a 5432. Dentro do container a porta continua sendo a 5432.

### 3. Rodar a API

```bash
cd java
./mvnw spring-boot:run
```

No Windows (CMD/PowerShell):

```
cd java
mvnw.cmd spring-boot:run
```

A API sobe em `http://localhost:8080`. O Flyway cria as tabelas sozinho.

### 4. Swagger

**http://localhost:8080/swagger-ui.html**

Para testar as rotas protegidas: faça login, copie o `token`, clique em **Authorize** no topo
e cole o token (sem escrever `Bearer `).

---

## Como a segurança funciona

### Fluxo do token

1. `POST /auth/registrar` ou `POST /auth/login` devolvem um **JWT** válido por 24h.
2. O cliente envia o token em toda requisição: `Authorization: Bearer <token>`.
3. O `JwtAuthenticationFilter` intercepta, valida a assinatura e coloca o usuário no contexto
   do Spring Security.
4. Sem token válido, a requisição para no filtro e volta `401`.

O token carrega o **id do usuário** no `subject`, mais o email e o tipo como claims. A
assinatura usa HMAC com a chave de `jwt.secret`.

### Rotas públicas

Só `/auth/**` e o Swagger. Todo o resto exige token:

```java
.requestMatchers("/auth/**", "/swagger-ui.html", "/swagger-ui/**",
                 "/v3/api-docs/**", "/error").permitAll()
.anyRequest().authenticated()
```

### Autorização por tipo de usuário

O `Usuario` implementa `UserDetails`, e o tipo vira uma role:

```java
return List.of(new SimpleGrantedAuthority("ROLE_" + tipo.name()));
```

Ou seja, `OUVINTE` vira `ROLE_OUVINTE` e `ARTISTA` vira `ROLE_ARTISTA`. Na branch `main` isso
é usado com `@PreAuthorize("hasRole('ARTISTA')")` nas rotas de cadastro de álbum e música.

### Validação de dono

Autenticado não basta: o `UsuarioService` confere se a conta é a do próprio usuário antes de
alterar ou excluir.

```java
private void validarDono(Long id, Usuario logado) {
    if (!logado.getId().equals(id)) {
        throw new AccessDeniedException("Operacao permitida apenas na propria conta");
    }
}
```

### Senha

Nunca gravada em texto puro — sempre com hash **BCrypt**. O `UsuarioResponseDTO` não tem o
campo senha, então ela nunca sai numa resposta.

### Limite de tentativas

Depois de **3 senhas erradas seguidas** para o mesmo email, novas tentativas voltam `429` por
**60 segundos**, com o header `Retry-After`. Um login correto zera a contagem, e 15 minutos
sem tentar também. Protege contra força bruta.

O controle é feito em memória (`TentativaLoginService`). Numa aplicação com várias instâncias
isso precisaria ir para o Redis, porque cada instância teria a própria contagem.

---

## Endpoints

### Autenticação — público

| Método | Rota | Body | Resposta |
|---|---|---|---|
| POST | `/auth/registrar` | `{ nome, email, senha, tipo }` | `201` com token |
| POST | `/auth/login` | `{ email, senha }` | `200` com token |

`tipo` é `"OUVINTE"` ou `"ARTISTA"`. Senha entre 6 e 50 caracteres.

### Usuário — exige token

| Método | Rota | Observação |
|---|---|---|
| GET | `/usuarios` | Lista os usuários |
| GET | `/usuarios/me` | Dados de quem está logado |
| GET | `/usuarios/{id}` | Busca por id |
| PUT | `/usuarios/{id}` | Atualiza nome e email — só a própria conta |
| PATCH | `/usuarios/{id}/senha` | Altera a senha — só a própria conta |
| PUT | `/usuarios/{id}/foto` | Foto de perfil (PNG/JPG até 2MB, base64) |
| DELETE | `/usuarios/{id}/foto` | Remove a foto |
| DELETE | `/usuarios/{id}` | Exclui a conta — só a própria conta |

---

## Exemplos

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
  "token": "eyJhbGciOiJIUzM4NCJ9...",
  "tipo": "Bearer",
  "expiraEmSegundos": 86400,
  "usuario": {
    "id": 1,
    "nome": "Luiz Fellipe",
    "email": "luiz@soundhub.com",
    "tipo": "OUVINTE",
    "foto": null
  }
}
```

### Requisição autenticada

```http
GET /usuarios/me
Authorization: Bearer eyJhbGciOiJIUzM4NCJ9...
```

### Sem token — 401

```json
{
  "timestamp": "2026-09-29T17:33:35.570524",
  "status": 401,
  "erro": "Unauthorized",
  "mensagem": "Token ausente, invalido ou expirado",
  "caminho": "/usuarios/me"
}
```

### Conta de outro usuário — 403

```json
{
  "status": 403,
  "erro": "Forbidden",
  "mensagem": "Voce nao tem permissao para realizar esta operacao",
  "caminho": "/usuarios/999"
}
```

### Excesso de tentativas — 429

```
HTTP/1.1 429
Retry-After: 60
```

```json
{
  "status": 429,
  "erro": "Too Many Requests",
  "mensagem": "Muitas tentativas de login. Tente novamente em 60 segundos",
  "caminho": "/auth/login"
}
```

---

## Tratamento de erros

Todo erro sai no mesmo formato, montado pelo `GlobalExceptionHandler` (`@RestControllerAdvice`).

| Status | Quando acontece |
|---|---|
| 400 | Campo inválido, JSON mal formado ou regra de negócio quebrada |
| 401 | Token ausente, inválido ou expirado; email ou senha errados |
| 403 | Tentou alterar a conta de outro usuário |
| 404 | Id inexistente |
| 409 | Email já cadastrado |
| 429 | Muitas tentativas de login seguidas |
| 500 | Erro inesperado |

Erros de validação vêm com o mapa `campos`, para o cliente marcar o input errado:

```json
{
  "status": 400,
  "erro": "Erro de validacao",
  "mensagem": "Um ou mais campos estao invalidos",
  "campos": { "senha": "A senha deve ter entre 6 e 50 caracteres" }
}
```

---

## Estrutura

Organizado **por módulo** (package-by-feature): cada assunto tem sua pasta, e dentro dela as
camadas separadas.

```text
java/src/main/java/com/soundhub/
├── auth/                    # cadastro e login
│   ├── controller/AuthController.java
│   ├── service/AuthService.java
│   ├── service/TentativaLoginService.java
│   └── dto/
├── usuario/                 # CRUD de usuário
│   └── controller/  service/  repository/  entity/  dto/
└── common/
    ├── config/SecurityConfig.java      # regras de acesso
    ├── config/OpenApiConfig.java       # Swagger
    ├── security/JwtService.java        # gera e valida o token
    ├── security/JwtAuthenticationFilter.java
    ├── security/UsuarioDetailsService.java
    ├── security/SecurityErrorHandler.java
    ├── exception/                      # GlobalExceptionHandler e as exceções
    └── util/EmailUtils.java

java/src/main/resources/db/migration/
├── V1__create_usuario.sql
└── V2__add_foto_usuario.sql
```

`auth/` não tem `entity/` nem `repository/` porque autenticação não tem tabela própria: o
`AuthService` trabalha em cima de `Usuario` e usa o `UsuarioRepository`, do módulo `usuario/`.

---

## Credenciais

O banco não vem com usuário pré-cadastrado — o primeiro é criado pelo `POST /auth/registrar`.

| | |
|---|---|
| Host do banco | localhost:5437 |
| Banco | soundhub |
| Usuário | postgres |
| Senha | 123 |

A chave do JWT e as credenciais do banco podem ser trocadas pelas variáveis de ambiente
`JWT_SECRET`, `DB_URL`, `DB_USER` e `DB_PASSWORD`. O valor padrão do `jwt.secret` está no
`application.yml` e serve só para desenvolvimento.
