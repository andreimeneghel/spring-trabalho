"use client";

import { useRef } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";

import { logoutAction } from "@/lib/auth/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { iniciais } from "@/lib/utils/formato";
import type { Usuario } from "@/types/api";

export function MenuUsuario({ usuario }: { usuario: Usuario }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2 px-2 py-1.5"
          aria-label="Abrir menu da conta"
        >
          <Avatar className="size-7">
            {usuario.foto && <AvatarImage src={usuario.foto} alt="" />}
            <AvatarFallback className="bg-marca text-xs font-bold text-white">
              {iniciais(usuario.nome)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm sm:inline">{usuario.nome}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-bold">{usuario.nome}</p>
          <p className="truncate text-xs font-normal text-texto-suave">
            {usuario.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/perfil">
            <UserIcon className="size-4" />
            Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/*
          O form fica fora do DropdownMenuItem e o submit e disparado no onSelect:
          se o item virasse o próprio form (asChild), o Radix fecharia o menu antes
          do submit acontecer e o logout nao saia.
        */}
        <form ref={formRef} action={logoutAction} />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }}
        >
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
