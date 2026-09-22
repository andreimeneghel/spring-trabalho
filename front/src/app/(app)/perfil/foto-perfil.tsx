"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { atualizarFotoAction, removerFotoAction } from "./actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { iniciais } from "@/lib/utils/formato";
import type { Usuario } from "@/types/api";

const TIPOS_ACEITOS = ["image/png", "image/jpeg"];
const TAMANHO_MAXIMO = 2 * 1024 * 1024; // 2MB

export function FotoPerfil({ usuario }: { usuario: Usuario }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendente, startTransition] = useTransition();
  // mostra a nova foto na hora, sem esperar o servidor responder
  const [previa, setPrevia] = useState<string | null>(null);

  const fotoAtual = previa ?? usuario.foto;

  function escolherArquivo(arquivo: File) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.error("Formato inválido. Envie uma imagem PNG ou JPG.");
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    const leitor = new FileReader();

    leitor.onerror = () => toast.error("Não foi possível ler o arquivo.");

    leitor.onload = () => {
      const dataUri = String(leitor.result);
      setPrevia(dataUri);

      startTransition(async () => {
        const resultado = await atualizarFotoAction(usuario.id, dataUri);
        if (resultado.ok) {
          toast.success("Foto atualizada");
        } else {
          setPrevia(null); // desfaz a previa se o servidor recusou
          toast.error(resultado.erro);
        }
      });
    };

    leitor.readAsDataURL(arquivo);
  }

  function remover() {
    startTransition(async () => {
      const resultado = await removerFotoAction(usuario.id);
      if (resultado.ok) {
        setPrevia(null);
        toast.success("Foto removida");
      } else {
        toast.error(resultado.erro);
      }
    });
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <Avatar className="size-20 border border-border">
          {fotoAtual && <AvatarImage src={fotoAtual} alt="" />}
          <AvatarFallback className="bg-marca text-2xl font-bold text-white">
            {iniciais(usuario.nome)}
          </AvatarFallback>
        </Avatar>

        {/* Botão sobreposto no canto do avatar */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pendente}
          aria-label="Escolher foto de perfil"
          className="absolute -bottom-1 -right-1 flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-background bg-marca text-white transition-colors hover:bg-marca-clara hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Camera className="size-4" />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="sr-only"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) escolherArquivo(arquivo);
            e.target.value = ""; // permite reenviar o mesmo arquivo
          }}
        />
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-bold">Foto de perfil</p>
          <p className="text-xs text-texto-suave">
            PNG ou JPG, até 2MB.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={pendente}
            onClick={() => inputRef.current?.click()}
          >
            {pendente ? "Enviando..." : fotoAtual ? "Trocar" : "Escolher foto"}
          </Button>

          {fotoAtual && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendente}
                  className="text-texto-suave hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remover a foto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Seu avatar volta a mostrar as iniciais do seu nome.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={remover}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}
