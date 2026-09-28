"use client";

import { useState, type MouseEvent } from "react";
import {
  Calendar,
  MoreHorizontal,
  Pencil,
  Share2,
  ExternalLink,
  Trash2,
  Pin,
  RotateCcw,
  XCircle,
  Copy,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

import { FolderCard } from "@/components/ui/folder-card";
import { DocumentCover } from "@/components/DocumentCover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn, dateConverter } from "@/lib/utils";
import { coverForKey } from "@/lib/landing-assets";
import { deleteDocument, duplicateDocument, restoreDocument, trashDocument, updateDocument } from "@/lib/actions/room.actions";
import { toggleFavorite } from "@/lib/actions/document-prefs.actions";
import { useActionErrorMessage } from "@/components/hooks/use-action-error";

type DocumentCardProps = {
  id: string;
  title: string;
  createdAt: string;
  isOwner: boolean;
  role: DocumentRole;
  icon: string | null;
  starred: boolean;
  snippet: string | null;
  /** true kalau kartu ini dirender di tab Sampah — menu berubah jadi Pulihkan/Hapus permanen. */
  isTrashed?: boolean;
  /** "grid" = kartu map (default); "list" = baris ringkas. */
  view?: "grid" | "list";
};

// Overlay buttons duduk di atas <Link> pembungkus kartu (grid) — semua handler-nya
// menahan event supaya klik pada tombol tidak ikut membuka dokumen.
const stopAndRun = (fn: () => void) => (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  fn();
};

export const DocumentCard = ({
  id,
  title,
  createdAt,
  isOwner,
  role,
  icon,
  starred,
  snippet,
  isTrashed = false,
  view = "grid",
}: DocumentCardProps) => {
  const t = useTranslations("Dashboard");
  const tShare = useTranslations("Share");
  const locale = useLocale();
  const router = useRouter();
  const errorMessage = useActionErrorMessage();

  const canManage = isOwner || role === "editor";
  const cover = coverForKey(id);
  const displayTitle = title || "Untitled";

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(title);
  const [iconValue, setIconValue] = useState(icon ?? "");
  const [saving, setSaving] = useState(false);
  const [isStarred, setIsStarred] = useState(starred);
  const [starPending, setStarPending] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const roleLabel = role === "owner" ? t("roleOwner") : role === "editor" ? t("roleEditor") : t("roleViewer");

  const saveRename = async () => {
    const next = renameValue.trim();
    if (!next) return;
    setSaving(true);
    const result = await updateDocument({ roomId: id, title: next, icon: iconValue.trim().slice(0, 16) });
    setSaving(false);
    if (result.ok) {
      toast.success(t("renamed"));
      setRenameOpen(false);
      router.refresh();
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const handleTrash = async () => {
    const result = await trashDocument({ roomId: id });
    if (result.ok) {
      toast.success(t("movedToTrash"));
      router.refresh();
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const handleRestore = async () => {
    const result = await restoreDocument({ roomId: id });
    if (result.ok) {
      toast.success(t("restored"));
      router.refresh();
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const handleDeletePermanently = async () => {
    const result = await deleteDocument({ roomId: id });
    if (result.ok) {
      toast.success(t("deleted"));
      router.refresh();
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const handleDuplicate = async () => {
    if (duplicating) return;
    setDuplicating(true);
    const result = await duplicateDocument({ roomId: id, title: `${displayTitle} ${t("copySuffix")}` });
    setDuplicating(false);
    if (result.ok) {
      toast.success(t("duplicated"));
      router.push(`/documents/${result.data.id}`);
    } else {
      toast.error(errorMessage(result.error));
    }
  };

  const handleToggleStar = async () => {
    const next = !isStarred;
    setIsStarred(next); // optimistic
    setStarPending(true);
    const result = await toggleFavorite({ roomId: id, starred: next });
    setStarPending(false);
    if (!result.ok) {
      setIsStarred(!next); // rollback
      toast.error(errorMessage(result.error));
    }
  };

  const openRename = () => {
    setRenameValue(title);
    setIconValue(icon ?? "");
    setRenameOpen(true);
  };

  /* ------------------------------ potongan UI bersama ------------------------------ */

  // Tombol bulat di atas sampul (grid) atau di baris (list): satu bentuk `icon-btn`.
  const btnCls = view === "grid" ? "icon-btn icon-btn-card icon-btn-glass" : "icon-btn icon-btn-sm";

  const roleBadge = (
    <div
      className={cn(
        "rounded-full border border-hairline font-semibold text-ink",
        view === "grid" ? "card-badge bg-card/90 backdrop-blur" : "px-2.5 py-1 text-xs bg-recessed"
      )}
    >
      {roleLabel}
    </div>
  );

  const pinButton = !isTrashed && (
    <button
      type="button"
      onClick={stopAndRun(handleToggleStar)}
      disabled={starPending}
      aria-pressed={isStarred}
      aria-label={isStarred ? t("unpin") : t("pin")}
      title={isStarred ? t("unpin") : t("pin")}
      className={btnCls}
    >
      <Pin className={isStarred ? "size-4 fill-violet text-violet-ink" : "size-4"} aria-hidden />
    </button>
  );

  const actions = isTrashed ? (
    isOwner && (
      <>
        <button
          type="button"
          onClick={stopAndRun(handleRestore)}
          aria-label={t("restore")}
          title={t("restore")}
          className={btnCls}
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={stopAndRun(handleDeletePermanently)}
          aria-label={t("deleteForever")}
          title={t("deleteForever")}
          className={cn(btnCls, "icon-btn-danger")}
        >
          <XCircle className="size-4" aria-hidden />
        </button>
      </>
    )
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("documentsSuffix")}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={btnCls}
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e: MouseEvent) => e.stopPropagation()}>
        <DropdownMenuItem asChild>
          <Link href={`/documents/${id}`} className="flex items-center gap-2">
            <ExternalLink className="size-4" aria-hidden /> {t("open")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/documents/${id}?share=1`} className="flex items-center gap-2">
            <Share2 className="size-4" aria-hidden /> {tShare("trigger")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={stopAndRun(handleDuplicate)} className="flex items-center gap-2">
          <Copy className="size-4" aria-hidden /> {t("duplicate")}
        </DropdownMenuItem>
        {canManage && (
          <DropdownMenuItem onClick={stopAndRun(openRename)} className="flex items-center gap-2">
            <Pencil className="size-4" aria-hidden /> {t("menuRename")}
          </DropdownMenuItem>
        )}
        {isOwner && (
          <DropdownMenuItem
            onClick={stopAndRun(handleTrash)}
            className="flex items-center gap-2 text-danger focus:bg-danger-soft focus:text-danger"
          >
            <Trash2 className="size-4" aria-hidden /> {t("delete")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renameDialog = (
    <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("renameTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            maxLength={120}
            autoFocus
            aria-label={t("renameTitle")}
            className="bg-recessed"
          />
          <div>
            <label htmlFor={`icon-${id}`} className="mb-1 block text-xs font-medium text-muted">
              {t("chooseIcon")}
            </label>
            <Input
              id={`icon-${id}`}
              value={iconValue}
              onChange={(e) => setIconValue(e.target.value)}
              placeholder="📄"
              maxLength={16}
              className="w-24 bg-recessed text-center text-lg"
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setRenameOpen(false)} className="flex-1">
            {t("renameCancel")}
          </Button>
          <Button onClick={saveRename} disabled={saving} className="flex-1">
            {t("renameSave")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const mark = (sizeCls: string, textCls: string) => (
    <span
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full border border-hairline bg-card/85 font-display font-bold text-ink shadow-adora backdrop-blur-sm",
        sizeCls,
        textCls
      )}
    >
      {icon || displayTitle.trim().charAt(0).toUpperCase()}
    </span>
  );

  /* ------------------------------------ list ------------------------------------ */

  if (view === "list") {
    return (
      <>
        <div className="group relative flex items-center gap-3 rounded-panel border border-hairline bg-card p-2.5 pr-3 shadow-adora transition hover:-translate-y-0.5 hover:border-violet/40 sm:gap-4 sm:p-3">
          {/* Tautan menutupi seluruh baris; tombol aksi ada di lapisan di atasnya. */}
          <Link href={`/documents/${id}`} aria-label={displayTitle} className="absolute inset-0 z-0 rounded-panel" />

          <div className="pointer-events-none relative size-14 shrink-0 overflow-hidden rounded-[14px] sm:size-16">
            <DocumentCover cover={cover} sizes="64px" />
            <div className="absolute inset-0 flex items-center justify-center">
              {mark("size-8 text-sm sm:size-9 sm:text-base", icon ? "text-lg sm:text-xl" : "")}
            </div>
          </div>

          <div className="pointer-events-none relative min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold tracking-[-0.02em] text-ink">{displayTitle}</h3>
            {snippet && <p className="truncate text-sm text-muted">{snippet}</p>}
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="size-3.5 shrink-0" aria-hidden />
              {dateConverter(createdAt, locale)}
            </p>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5">
            <span className="hidden sm:block">{roleBadge}</span>
            {pinButton}
            {actions}
          </div>
        </div>
        {renameDialog}
      </>
    );
  }

  /* ------------------------------------ grid ------------------------------------ */

  const footer = (
    <>
      <span className="flex min-w-0 items-center gap-1.5 text-[clamp(10px,3.6cqw,13px)] text-muted">
        <Calendar className="size-[clamp(11px,4cqw,14px)] shrink-0" aria-hidden />
        <span className="truncate">{dateConverter(createdAt, locale)}</span>
      </span>
      <span className="card-open-pill inline-flex shrink-0 items-center rounded-control border border-hairline bg-recessed px-[clamp(8px,3cqw,12px)] py-[clamp(3px,1.6cqw,6px)] text-[clamp(10px,3.6cqw,13px)] font-semibold text-violet-ink transition group-hover:border-violet/40">
        {t("open")}
      </span>
    </>
  );

  // Kartu diklik seluruhnya → buka dokumen. Tombol aksi (pin & menu) TIDAK berada
  // di dalam <a>, dan wrapper-nya menghentikan propagasi klik, sehingga klik pada
  // tombol tidak ikut membuka editor.
  const openDocument = () => router.push(`/documents/${id}`);

  return (
    <>
      <div
        role="link"
        tabIndex={0}
        aria-label={displayTitle}
        onClick={openDocument}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target === e.currentTarget) openDocument();
        }}
        className="group block cursor-pointer rounded-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
      >
        <FolderCard
          title={icon ? `${icon} ${displayTitle}` : displayTitle}
          subtitle={snippet ?? undefined}
          coverNode={<DocumentCover cover={cover} sizes="(min-width: 1536px) 300px, (min-width: 1024px) 30vw, 46vw" />}
          topLeftSlot={
            <>
              {roleBadge}
              <div data-card-action onClick={(e) => e.stopPropagation()}>
                {pinButton}
              </div>
            </>
          }
          topRightSlot={
            <div data-card-action onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          }
          footer={footer}
        />
      </div>
      {renameDialog}
    </>
  );
};
