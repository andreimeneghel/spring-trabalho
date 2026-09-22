# Frontend do SoundHub

> **Leia primeiro o [AGENTS.md da raiz](../AGENTS.md)** — ele tem as regras do projeto
> (sempre testar, manter o FRONTEND.md atualizado, encerrar as portas) e a estrutura das
> duas aplicações. O contrato da API está em [../FRONTEND.md](../FRONTEND.md).
>
> Este projeto roda na **porta 3001** (`next dev -p 3001`), porque a 3000 está ocupada por
> outro container nesta máquina. Se mudar, ajuste também o CORS da API em
> `java/src/main/java/com/soundhub/common/config/SecurityConfig.java`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
