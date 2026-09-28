"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, FileText, Loader2, NotebookPen, Plus, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { createDocument } from "@/lib/actions/room.actions";
import { useRouter } from "@/i18n/navigation";
import { useActionErrorMessage } from "@/components/hooks/use-action-error";
import { TEMPLATE_IDS, type TemplateId } from "@/lib/editor/templates";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Ikon per template — cuma visual, tidak perlu i18n (sama untuk semua locale).
const TEMPLATE_ICONS: Record<TemplateId, typeof FileText> = {
  "meeting-notes": NotebookPen,
  "project-brief": FileText,
  "weekly-report": TrendingUp,
};

const AddDocumentBtn = () => {
  const t = useTranslations("Dashboard");
  const errorMessage = useActionErrorMessage();
  // Router next-intl → locale tetap terjaga (sebelumnya `next/navigation` menjatuhkan locale).
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addDocumentHandler = async (templateId?: TemplateId) => {
    if (loading) return;
    setLoading(true);
    const result = await createDocument();
    if (result.ok) {
      const suffix = templateId ? `?template=${templateId}` : "";
      router.push(`/documents/${result.data.id}${suffix}`);
      return; // biarkan state loading sampai navigasi selesai
    }
    toast.error(errorMessage(result.error));
    setLoading(false);
  };

  return (
    <div className="flex">
      <Button
        onClick={() => addDocumentHandler()}
        disabled={loading}
        aria-label={t("newDocument")}
        className="h-11 rounded-r-none px-4 sm:px-5"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            <span className="hidden sm:block">{t("creating")}</span>
          </>
        ) : (
          <>
            <Plus aria-hidden />
            <span className="hidden sm:block">{t("newDocument")}</span>
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={loading}
          aria-label={t("fromTemplate")}
          className="inline-flex h-11 items-center justify-center rounded-r-control border-l border-on-accent/30 bg-action px-2.5 text-on-accent transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronDown className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {TEMPLATE_IDS.map((id) => {
            const Icon = TEMPLATE_ICONS[id];
            return (
              <DropdownMenuItem
                key={id}
                onClick={() => addDocumentHandler(id)}
                className="items-start gap-3 py-2.5"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-recessed text-violet-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-medium text-ink">{t(`template_${id}`)}</span>
                  <span className="truncate text-xs text-muted">{t(`template_${id}_desc`)}</span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AddDocumentBtn;
