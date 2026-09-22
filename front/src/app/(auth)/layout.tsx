import Image from "next/image";

import { AlternarTema } from "@/components/comum/alternar-tema";
import { LogoComNome } from "@/components/comum/logo";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Painel de apresentacao — some no mobile */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-10 lg:flex">
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

        <div className="relative">
          <LogoComNome sobreEscuro altura={76} />
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

        <div className="relative flex items-center gap-3">
          {/*
            A logo da UNESC tem o texto em preto, que sumiria no fundo escuro:
            o fundo branco arredondado devolve o contraste e preserva a marca.
          */}
          <span className="inline-flex items-center rounded-md bg-white/95 px-2.5 py-1.5">
            <Image
              src="/img/unesc.webp"
              alt="UNESC"
              width={64}
              height={30}
              className="h-7 w-auto"
            />
          </span>
          <p className="text-xs leading-snug text-white/60">
            Projeto acadêmico
            <br />
            Universidade do Extremo Sul Catarinense
          </p>
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12">
        {/* Mesmo brilho verde usado nas paginas internas */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-marca/[0.10] to-transparent"
        />

        <div className="absolute right-4 top-4">
          <AlternarTema />
        </div>

        <div className="relative w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <LogoComNome altura={64} />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
