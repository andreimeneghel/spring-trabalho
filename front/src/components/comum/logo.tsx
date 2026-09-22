import Image from "next/image";

import { cn } from "@/lib/utils";

/** Dimensoes reais de public/img/logo1.png */
const LARGURA = 725;
const ALTURA = 344;

/**
 * Marca do SoundHub.
 *
 * A imagem traz o simbolo e o nome, com "Sound" em branco. No tema claro esse
 * branco sumiria, entao o filtro `invert` escurece a logo — o verde fica um
 * pouco diferente, mas o nome continua legivel.
 */
export function LogoComNome({
  className,
  /** No painel do login o fundo e sempre a foto escura, entao nao inverte. */
  sobreEscuro = false,
  /**
   * A imagem tem o simbolo empilhado sobre o nome, entao precisa de mais
   * altura que uma logo horizontal para o texto ficar legivel.
   */
  altura = 56,
}: {
  className?: string;
  sobreEscuro?: boolean;
  altura?: number;
}) {
  return (
    <Image
      src="/img/logo1.png"
      alt="SoundHub"
      width={LARGURA}
      height={ALTURA}
      priority
      className={cn("w-auto", !sobreEscuro && "invert dark:invert-0", className)}
      style={{ height: altura }}
    />
  );
}

/** Só o simbolo, recortado da mesma imagem. Util em espacos estreitos. */
export function Logo({
  className,
  tamanho = 28,
}: {
  className?: string;
  tamanho?: number;
}) {
  // o simbolo ocupa a faixa de cima da imagem, centralizado na horizontal
  const escala = tamanho / 170;

  return (
    <span
      className={cn("relative block shrink-0 overflow-hidden", className)}
      style={{ width: tamanho, height: tamanho }}
      aria-hidden="true"
    >
      <Image
        src="/img/logo1.png"
        alt=""
        width={LARGURA}
        height={ALTURA}
        priority
        className="absolute max-w-none"
        style={{
          width: LARGURA * escala,
          height: ALTURA * escala,
          left: -281 * escala,
          top: -41 * escala,
        }}
      />
    </span>
  );
}
