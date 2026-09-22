import Image from "next/image";

import { AlternarTema } from "@/components/comum/alternar-tema";
import { LogoComNome } from "@/components/comum/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Painel de apresentacao — some no mobile */}
      <aside className="relative hidden flex-col justify-end overflow-hidden border-r border-border p-10 lg:flex">
        {/* A foto e vertical, entao cobre o painel inteiro sem cortar nada importante */}
        <Image
          src="/img/image-_25_.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center blur-[2px]"
        />

        {/* Escurece a foto para o texto continuar legivel */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/55"
        />

        {/*
          Faixa verde no topo: bem escura e discreta, só para lembrar a marca
          sem competir com a foto nem com o texto.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,62,27,0.75) 0%, rgba(0,62,27,0.30) 50%, transparent 100%)",
          }}
        />

        {/* As duas marcas no topo, separadas por um risco vertical */}
        <div className="absolute inset-x-10 top-10 flex items-center gap-5">
          {/* as duas logos sao empilhadas: mesma altura deixa elas alinhadas */}
          <LogoComNome sobreEscuro altura={72} />

          <span aria-hidden="true" className="h-16 w-px shrink-0 bg-white/25" />

          <div className="flex items-center gap-3">
            <Image
              src="/img/unesc-claro.png"
              alt="UNESC"
              width={460}
              height={434}
              className="h-16 w-auto"
            />
            <p className="max-w-40 text-xs leading-snug text-white/70">
              Projeto acadêmico
              <br />
              Universidade do Extremo Sul Catarinense
            </p>
          </div>
        </div>

        <div className="relative max-w-sm space-y-4">
          {/* branco nos dois temas: o fundo aqui e sempre a foto escura */}
          <h2 className="text-3xl font-bold leading-tight text-white drop-shadow-lg">
            Sua música,
            <br />
            do seu jeito.
          </h2>
          <p className="text-sm leading-relaxed text-white/80 drop-shadow">
            Monte playlists, acompanhe o que os outros estão ouvindo e deixe sua
            avaliação nas músicas que marcaram você.
          </p>
        </div>

      </aside>

      <main className="relative flex items-center justify-center overflow-hidden px-6 py-12">
        {/*
          No mobile a mesma foto cobre o fundo, com blur mais forte para nao
          competir com o formulario. No desktop ela ja esta no painel ao lado.
        */}
        <Image
          src="/img/image-_25_.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center blur-sm lg:hidden"
        />

        {/* Escurece a foto para os campos e o texto ficarem legiveis */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/80 lg:hidden"
        />

        {/* Brilho verde do topo, igual ao das paginas internas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-marca/[0.10] to-transparent"
        />

        {/*
          So no desktop: no mobile o fundo e sempre a foto escura, entao trocar
          o tema aqui nao mudaria nada visivel. O usuario troca depois de entrar.
        */}
        <div className="absolute right-4 top-4 z-10 hidden lg:block">
          <AlternarTema />
        </div>

        {/*
          No mobile o fundo e sempre a foto escura, entao o texto precisa ser
          claro mesmo no tema claro. Em vez de mexer em cada pagina, o proprio
          bloco redefine os tokens de cor ate o breakpoint lg — tudo que usa
          `texto-suave`, `border` e afins se ajusta junto.
        */}
        <div className="auth-sobre-foto relative w-full max-w-sm">
          {/*
            No mobile as duas marcas tambem aparecem, mas sem o texto de apoio:
            a tela e estreita e o formulario e o que importa aqui.
          */}
          <div className="mb-10 flex items-center justify-center gap-5 lg:hidden">
            {/* as duas logos sao empilhadas: mesma altura deixa elas alinhadas */}
            <LogoComNome sobreEscuro altura={72} />

            <span aria-hidden="true" className="h-16 w-px shrink-0 bg-white/25" />

            <Image
              src="/img/unesc-claro.png"
              alt="UNESC"
              width={460}
              height={434}
              className="h-16 w-auto"
            />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
