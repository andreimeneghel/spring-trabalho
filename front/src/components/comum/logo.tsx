import Image from "next/image";

import { cn } from "@/lib/utils";

/** Dimensoes reais de public/img/logo1.png */
const LARGURA = 422;
const ALTURA = 251;

/**
 * Marca do SoundHub.
 *
 * A imagem traz o simbolo e o nome, com "Sound" em branco — que sumiria no tema
 * claro. Por isso existem duas variantes do arquivo (logo1 e logo1-claro), e o
 * CSS mostra a certa conforme o tema.
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
  // Sobre a foto escura do login sempre vale a versao de texto branco.
  if (sobreEscuro) {
    return (
      <Image
        src="/img/logo1.png"
        alt="SoundHub"
        width={LARGURA}
        height={ALTURA}
        priority
        className={cn("w-auto", className)}
        style={{ height: altura }}
      />
    );
  }

  /*
    Duas imagens, uma por tema, alternadas pelo CSS. O filtro `invert` que havia
    antes transformava o verde da marca em rosa no tema claro; a variante
    logo1-claro tem o texto escuro e mantem o verde original.
  */
  return (
    <>
      <Image
        src="/img/logo1-claro.png"
        alt="SoundHub"
        width={LARGURA}
        height={ALTURA}
        priority
        className={cn("w-auto dark:hidden", className)}
        style={{ height: altura }}
      />
      <Image
        src="/img/logo1.png"
        alt="SoundHub"
        width={LARGURA}
        height={ALTURA}
        priority
        className={cn("hidden w-auto dark:block", className)}
        style={{ height: altura }}
      />
    </>
  );
}

/** Só o simbolo, sem o nome. Util na sidebar recolhida e em espacos estreitos. */
export function Logo({
  className,
  tamanho = 28,
}: {
  className?: string;
  tamanho?: number;
}) {
  return (
    <Image
      src="/img/logo-simbolo.png"
      alt=""
      width={256}
      height={256}
      priority
      aria-hidden="true"
      className={cn("shrink-0", className)}
      style={{ width: tamanho, height: tamanho }}
    />
  );
}
