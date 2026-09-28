"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { trashDocument } from "@/lib/actions/room.actions";
import { useActionErrorMessage } from "@/components/hooks/use-action-error";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import { Trash2, AlertTriangle } from "lucide-react";

export const DeleteModal = ({ roomId, redirectOnDelete = false }: DeleteModalProps) => {
  const router = useRouter();
  const t = useTranslations("DeleteModal");
  const tDash = useTranslations("Dashboard");
  const errorMessage = useActionErrorMessage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteDocumentHandler = async () => {
    setLoading(true);
    const result = await trashDocument({ roomId });
    setLoading(false);

    if (result.ok) {
      setOpen(false);
      toast.success(t("deleted"));
      if (redirectOnDelete) router.push("/documents");
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" aria-label={t("title")} className="icon-btn icon-btn-danger">
          <Trash2 className="size-4" aria-hidden />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
              <AlertTriangle className="size-7" aria-hidden />
            </span>
          </div>

          <DialogTitle className="text-center">
            {t("title")}
          </DialogTitle>

          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-col-reverse">
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              {t("cancel")}
            </Button>
          </DialogClose>

          <Button
            onClick={deleteDocumentHandler}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 aria-hidden />
            {loading ? tDash("deleting") : tDash("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
