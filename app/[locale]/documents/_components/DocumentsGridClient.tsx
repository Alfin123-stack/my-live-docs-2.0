"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileX, AlertTriangle, RotateCcw, LayoutGrid, List, Trash2, Sparkles } from "lucide-react";

import { DocumentCard } from "./DocumentCard";
import { useDocumentSearch } from "./DocumentSearchContext";
import { DocumentCover } from "@/components/DocumentCover";
import { Button } from "@/components/ui/button";
import AddDocumentBtn from "@/components/AddDocumentBtn";
import { Painting } from "@/components/landing/art";
import { coverForKey } from "@/lib/landing-assets";
import { Link } from "@/i18n/navigation";
import { cn, dateConverter } from "@/lib/utils";

type DocumentItem = {
  id: string;
  title: string;
  createdAt: string;
  isOwner: boolean;
  role: DocumentRole;
  icon: string | null;
  starred: boolean;
  snippet: string | null;
  deletedAt: string | null;
};

type DocumentsGridClientProps = {
  documents: DocumentItem[];
  /** true kalau listDocuments() gagal di server — beda dari "belum ada dokumen". */
  loadError?: boolean;
  /** roomId dokumen yang paling baru dibuka user (untuk baris "Baru dibuka"). */
  recentIds: string[];
};

const PAGE_SIZE = 12;
const VIEW_STORAGE_KEY = "livedocs:dashboard-view";
const ease = [0.22, 1, 0.36, 1] as const;

export default function DocumentsGridClient({ documents, loadError = false, recentIds }: DocumentsGridClientProps) {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const searchParams = useSearchParams();

  const search = useDocumentSearch();
  const sort = searchParams.get("sort");
  const date = searchParams.get("date");
  const scope = searchParams.get("scope") || "all";

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [view, setView] = useState<"grid" | "list">("grid");
  const reduceMotion = useReducedMotion();

  // Preferensi grid/list disimpan per perangkat (localStorage) — bukan data yang perlu
  // disinkronkan lintas device, jadi tidak perlu MongoDB. Sengaja lewat effect (bukan lazy
  // initializer di useState) supaya render pertama cocok dengan HTML dari server (SSR selalu
  // "grid"); membaca localStorage di initializer akan memicu hydration mismatch.
  useEffect(() => {
    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lihat catatan di atas
    if (stored === "list" || stored === "grid") setView(stored);
  }, []);

  // Reset paginasi client-side saat filter/scope berubah — turunan dari searchParams yang
  // sudah dibaca lewat hook (bukan prop biasa), jadi tidak ada tempat lain yang lebih alami
  // untuk mereset selain effect ini.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset halaman saat filter berubah
    setVisibleCount(PAGE_SIZE);
  }, [search, sort, date, scope]);

  const setViewMode = (next: "grid" | "list") => {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const hasActiveFilters = Boolean(search || (date && date !== "all") || (scope && scope !== "all"));

  const activeDocuments = useMemo(() => documents.filter((d) => !d.deletedAt), [documents]);

  const recentDocuments = useMemo(() => {
    const byId = new Map(activeDocuments.map((d) => [d.id, d]));
    return recentIds.map((id) => byId.get(id)).filter((d): d is DocumentItem => Boolean(d));
  }, [activeDocuments, recentIds]);

  const showRecentRow = scope === "all" && !hasActiveFilters && recentDocuments.length > 0;

  const filteredItems = useMemo(() => {
    let result = scope === "trash" ? documents.filter((d) => d.deletedAt) : activeDocuments;

    if (scope === "mine") result = result.filter((doc) => doc.isOwner);
    if (scope === "shared") result = result.filter((doc) => !doc.isOwner);
    if (scope === "starred") result = result.filter((doc) => doc.starred);

    if (search) {
      result = result.filter((doc) => doc.title.toLowerCase().includes(search));
    }

    if (scope !== "trash" && date && date !== "all") {
      const today = new Date();
      result = result.filter((doc) => {
        const docDate = new Date(doc.createdAt);
        switch (date) {
          case "today":
            return (
              docDate.getDate() === today.getDate() &&
              docDate.getMonth() === today.getMonth() &&
              docDate.getFullYear() === today.getFullYear()
            );
          case "week": {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            return docDate >= oneWeekAgo && docDate <= today;
          }
          case "month":
            return docDate.getMonth() === today.getMonth() && docDate.getFullYear() === today.getFullYear();
          case "year":
            return docDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }

    if (scope === "trash") {
      // Sampah: yang paling baru dihapus dulu.
      result = [...result].sort(
        (a, b) => new Date(b.deletedAt ?? 0).getTime() - new Date(a.deletedAt ?? 0).getTime()
      );
    } else {
      const effectiveSort = sort || "newest";
      result = [...result].sort((a, b) => {
        switch (effectiveSort) {
          case "az":
            return a.title.localeCompare(b.title);
          case "za":
            return b.title.localeCompare(a.title);
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    if (scope !== "trash") {
      // Dokumen yang di-pin selalu di atas; urutan di dalam tiap grup tetap.
      result = [...result].sort((a, b) => Number(b.starred) - Number(a.starred));
    }

    return result;
  }, [documents, activeDocuments, search, sort, date, scope]);

  const displayItems = filteredItems.slice(0, visibleCount);
  const hasMore = filteredItems.length > displayItems.length;

  if (loadError) {
    return (
      <div className="pt-6 sm:pt-8">
        <div className="document-list-empty py-16">
          <span className="flex size-16 items-center justify-center rounded-full bg-danger-soft text-danger">
            <AlertTriangle className="size-8" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{t("errorTitle")}</p>
            <p className="text-sm text-muted">{t("errorSubtitle")}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw aria-hidden /> {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  const gridClass =
    view === "grid"
      ? "grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,210px),1fr))] sm:gap-4"
      : "flex flex-col gap-3";

  return (
    <div className="pt-6 sm:pt-8">
      {showRecentRow && (
        <section className="mb-8" aria-labelledby="recent-heading">
          <h3 id="recent-heading" className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {t("recentlyOpened")}
          </h3>
          <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 custom-scrollbar">
            {recentDocuments.map((doc, i) => {
              const cover = coverForKey(doc.id);
              return (
                <motion.div
                  key={doc.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04, ease }}
                  className="shrink-0 snap-start"
                >
                  <Link
                    href={`/documents/${doc.id}`}
                    className="group flex w-[240px] items-center gap-3 rounded-panel border border-hairline bg-card p-2.5 shadow-adora transition hover:-translate-y-0.5 hover:border-violet/40"
                  >
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-[12px]">
                      <DocumentCover cover={cover} sizes="44px" />
                      <span
                        className="absolute inset-0 flex items-center justify-center font-display text-base font-bold text-ink"
                        aria-hidden
                      >
                        <span className="flex size-7 items-center justify-center rounded-full border border-hairline bg-card/85 backdrop-blur-sm">
                          {doc.icon || (doc.title || "U").trim().charAt(0).toUpperCase()}
                        </span>
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-sm font-bold tracking-[-0.01em] text-ink">{doc.title || "Untitled"}</p>
                      <p className="text-xs text-muted">{dateConverter(doc.createdAt, locale)}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mb-4 flex items-center justify-between gap-3" aria-live="polite">
        <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink sm:text-2xl">
          {scope === "trash" ? t("scopeTrash") : t("documentsSuffix")}{" "}
          <span className="font-sans text-base font-medium text-muted">({filteredItems.length})</span>
        </h2>

        {scope !== "trash" && filteredItems.length > 0 && (
          <div className="relative flex items-center gap-1 rounded-control border border-hairline bg-card p-1">
            {(["grid", "list"] as const).map((mode) => {
              const Icon = mode === "grid" ? LayoutGrid : List;
              const active = view === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-label={mode === "grid" ? t("viewGrid") : t("viewList")}
                  aria-pressed={active}
                  className="relative flex size-8 items-center justify-center rounded-[8px] text-ink-soft transition-colors hover:text-ink"
                >
                  {active && (
                    <motion.span
                      layoutId="dashboard-view-toggle-active"
                      transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease }}
                      className="absolute inset-0 rounded-[8px] bg-action"
                    />
                  )}
                  <Icon className={cn("relative size-4", active && "text-on-accent")} aria-hidden />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {displayItems.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            <div className={gridClass}>
              <AnimatePresence mode="popLayout" initial={false}>
                {displayItems.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.28, ease, delay: reduceMotion ? 0 : Math.min(i, 6) * 0.03 }}
                  >
                    <DocumentCard
                      id={doc.id}
                      title={doc.title}
                      createdAt={doc.createdAt}
                      isOwner={doc.isOwner}
                      role={doc.role}
                      icon={doc.icon}
                      starred={doc.starred}
                      snippet={doc.snippet}
                      isTrashed={scope === "trash"}
                      view={scope === "trash" ? "grid" : view}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <Button variant="outline" size="lg" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
            {t("loadMore")}
          </Button>
        </div>
      )}

      {displayItems.length === 0 && scope === "trash" && (
        <div className="document-list-empty py-16">
          <span className="flex size-16 items-center justify-center rounded-full bg-recessed text-muted">
            <Trash2 className="size-8" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{t("trashEmpty")}</p>
            <p className="text-sm text-muted">{t("trashEmptySubtitle")}</p>
          </div>
        </div>
      )}

      {/* Belum ada dokumen: bingkai lukisan seperti di landing + ajakan membuat dokumen. */}
      {displayItems.length === 0 && scope !== "trash" && documents.length === 0 && (
        <div className="relative overflow-hidden rounded-[28px] p-3 sm:rounded-[36px] sm:p-6">
          <Painting id="lilies" position="35% 45%" width={1200} />
          <div className="relative mx-auto flex max-w-md flex-col items-center gap-4 rounded-panel border border-hairline bg-card/90 px-6 py-10 text-center shadow-adora backdrop-blur-md">
            <span className="flex size-14 items-center justify-center rounded-full bg-recessed text-violet-ink">
              <Sparkles className="size-7" aria-hidden />
            </span>
            <div className="space-y-1">
              <p className="font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">{t("empty")}</p>
              <p className="text-sm text-muted">{t("emptySubtitle")}</p>
            </div>
            <AddDocumentBtn />
          </div>
        </div>
      )}

      {displayItems.length === 0 && scope !== "trash" && documents.length > 0 && (hasActiveFilters || scope === "starred") && (
        <div className="document-list-empty py-16">
          <span className="flex size-16 items-center justify-center rounded-full bg-recessed text-muted">
            <FileX className="size-8" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="font-display text-xl font-bold tracking-[-0.02em] text-ink">{t("searchEmpty")}</p>
            <p className="text-sm text-muted">{t("searchEmptySubtitle")}</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/documents">{t("clearFilters")}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
