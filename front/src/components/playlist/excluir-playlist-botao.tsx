"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { excluirPlaylistAction } from "@/app/(app)/playlists/actions";
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
import { Button } from "@/components/ui/button";

export function ExcluirPlaylistBotao({
  id,
  nome,
}: {
  id: number;
  nome: string;
}) {
  const [pendente, startTransition] = useTransition();

  function excluir() {
    startTransition(async () => {
      // Em caso de sucesso a action redireciona; só voltamos aqui se der erro.
      const resultado = await excluirPlaylistAction(id);
      if (resultado?.erro) toast.error(resultado.erro);
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Excluir playlist">
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir &ldquo;{nome}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            A playlist e as musicas adicionadas nela serão removidas. Esta acao nao
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={excluir}
            disabled={pendente}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {pendente ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
