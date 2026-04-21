"use client";

import { Loader2, MoreVertical, RefreshCw, Trash2, VideoOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deletePlayAction, removePlayVideoAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import { AttachVideoDialog } from "./attach-video-dialog";

type Confirm = "remove-video" | "delete-play" | null;

export function PlayActionsMenu({
  playId,
  hasVideo,
  playLabel,
}: {
  playId: string;
  hasVideo: boolean;
  playLabel?: string;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemoveVideo() {
    setError(null);
    setSubmitting(true);
    const result = await removePlayVideoAction({ playId });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirm(null);
    router.refresh();
  }

  async function handleDeletePlay() {
    setError(null);
    setSubmitting(true);
    const result = await deletePlayAction({ playId });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setConfirm(null);
    router.refresh();
  }

  function stop(event: React.MouseEvent | React.PointerEvent) {
    event.stopPropagation();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={stop}
          onPointerDown={stop}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-md",
            "bg-black/60 text-white backdrop-blur-sm",
            "hover:bg-black/80 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Ações do lance"
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={stop}
          onPointerDown={stop}
          className="w-44"
        >
          {hasVideo && (
            <>
              <DropdownMenuItem
                onSelect={() => setReplaceOpen(true)}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Trocar vídeo
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setError(null);
                  setConfirm("remove-video");
                }}
                className="gap-2"
              >
                <VideoOff className="h-4 w-4" />
                Remover vídeo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setError(null);
              setConfirm("delete-play");
            }}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Apagar lance
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasVideo && (
        <AttachVideoDialog
          playId={playId}
          open={replaceOpen}
          onOpenChange={setReplaceOpen}
          playLabel={playLabel}
          mode="replace"
        />
      )}

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => {
          if (submitting) return;
          if (!open) {
            setConfirm(null);
            setError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "remove-video"
                ? "Remover vídeo do lance?"
                : "Apagar este lance?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "remove-video"
                ? "O lance continua salvo, mas o vídeo e a miniatura serão desanexados. Essa ação não pode ser desfeita."
                : "O lance será removido permanentemente. Essa ação não pode ser desfeita."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (confirm === "remove-video") handleRemoveVideo();
                else if (confirm === "delete-play") handleDeletePlay();
              }}
              disabled={submitting}
              className={cn(
                confirm === "delete-play" &&
                  "bg-destructive text-white hover:bg-destructive/90"
              )}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirm === "remove-video" ? "Remover vídeo" : "Apagar lance"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
