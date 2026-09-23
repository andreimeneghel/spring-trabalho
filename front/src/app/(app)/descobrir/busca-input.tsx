"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/** Busca com debounce: espera o usuário parar de digitar antes de navegar. */
export function BuscaInput({
  valorInicial = "",
  placeholder = "Buscar",
}: {
  valorInicial?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [termo, setTermo] = useState(valorInicial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const atual = searchParams.get("q") ?? "";
    if (termo === atual) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (termo.trim()) {
        params.set("q", termo.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [termo, pathname, router, searchParams]);

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-texto-fraco" />
      <Input
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder={placeholder}
        className="pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
