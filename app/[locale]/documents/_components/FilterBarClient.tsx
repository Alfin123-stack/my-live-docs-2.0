"use client";

import { useCallback, useDeferredValue, useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, FileText, Filter, Search, SortDesc } from "lucide-react";

import AddDocumentBtn from "@/components/AddDocumentBtn";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { DocumentSearchContext } from "./DocumentSearchContext";

type QueryValue = string | null | undefined;

const SCOPES = ["all", "mine", "shared", "starred", "trash"] as const;
type Scope = (typeof SCOPES)[number];

const SORTS = ["newest", "oldest", "az", "za"] as const;
type Sort = (typeof SORTS)[number];

const DATES = ["all", "today", "week", "month", "year"] as const;
type DateRange = (typeof DATES)[number];

/** Satu grup filter (Cakupan / Urutkan / Tanggal) — tombol daftar dengan centang,
 * dipilih tunggal per grup (radio), bukan multi-select seperti pola referensi asli —
 * karena scope/sort/date di dashboard ini memang saling eksklusif. */
function FilterGroup<T extends string>({
  label,
  icon,
  items,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  items: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        {icon}
        {label}
      </p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const selected = value === item.value;
          return (
            <motion.button
              key={item.value}
              type="button"
              whileHover={{ x: 2 }}
              onClick={() => onChange(item.value)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-control border px-3 py-2 text-sm transition-colors",
                selected
                  ? "border-violet bg-action/10 text-violet-ink"
                  : "border-hairline text-ink-soft hover:border-violet/40 hover:bg-recessed"
              )}
            >
              <span>{item.label}</span>
              <AnimatePresence initial={false}>
                {selected && (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                    className="shrink-0"
                  >
                    <Check className="size-3.5" aria-hidden />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterBarClient({ total, children }: { total: number; children: ReactNode }) {
  const t = useTranslations("Dashboard");
  const params = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(() => params.get("search") ?? "");
  const [filterOpen, setFilterOpen] = useState(false);

  const scope = (params.get("scope") as Scope) || "all";
  const sort = (params.get("sort") as Sort) || "newest";
  const date = (params.get("date") as DateRange) || "all";

  const scopeLabel: Record<Scope, string> = {
    all: t("scopeAll"),
    mine: t("scopeMine"),
    shared: t("scopeShared"),
    starred: t("scopeStarred"),
    trash: t("scopeTrash"),
  };

  const sortLabel: Record<Sort, string> = {
    newest: t("sortRecent"),
    oldest: t("sortOldest"),
    az: `${t("sortName")} A\u2013Z`,
    za: `${t("sortName")} Z\u2013A`,
  };

  const dateLabel: Record<DateRange, string> = {
    all: t("dateAll"),
    today: t("dateToday"),
    week: t("dateWeek"),
    month: t("dateMonth"),
    year: t("dateYear"),
  };

  const updateQuery = useCallback(
    (updates: Record<string, QueryValue>) => {
      const currentParams = new URLSearchParams(window.location.search);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all" || value === "newest") currentParams.delete(key);
        else currentParams.set(key, value);
      });
      const query = currentParams.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router]
  );

  // Pencarian TIDAK lewat router/server: cukup sinkronkan URL (tanpa navigasi) dan
  // teruskan nilainya lewat context. useDeferredValue menjaga input tetap responsif.
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const url = new URL(window.location.href);
    const value = search.trim();
    if (value) url.searchParams.set("search", value);
    else url.searchParams.delete("search");
    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, "", url);
    }
  }, [search]);

  const activeFilterCount =
    (scope !== "all" ? 1 : 0) + (sort !== "newest" ? 1 : 0) + (date !== "all" ? 1 : 0);

  const clearFilters = () => {
    updateQuery({ scope: null, sort: null, date: null });
  };

  return (
    <>
      {/* baris toolbar ringkas: search + tombol filter (dengan badge) + tambah dokumen */}
      <div className="mt-6 flex items-center gap-2 sm:gap-3">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-field border border-hairline bg-card px-4 transition focus-within:border-violet">
          <Search className="size-4 shrink-0 text-muted sm:size-5" aria-hidden />
          <Input
            type="search"
            aria-label={t("search")}
            maxLength={100}
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value.slice(0, 100))}
            className="h-full w-full border-none bg-transparent p-0 text-ink-soft placeholder:text-muted focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilterOpen((v) => !v)}
          aria-pressed={filterOpen}
          aria-label={t("filterButton")}
          className={cn(
            "relative flex h-11 items-center gap-2 rounded-control border px-4 text-sm font-medium transition",
            filterOpen ? "border-violet bg-action/10 text-violet-ink" : "border-hairline bg-card text-ink-soft hover:bg-recessed"
          )}
        >
          <Filter className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t("filterButton")}</span>
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-action text-[11px] font-semibold text-on-accent">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="shrink-0">
          <AddDocumentBtn />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 sm:hidden">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <FileText className="size-3.5" aria-hidden />
          {total} {t("documentsSuffix")}
        </span>
      </div>

      {/* area di bawah toolbar: panel filter (slide-in) + konten (grid dokumen) */}
      <div className="relative mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              key="filter-panel"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden shrink-0 overflow-hidden rounded-panel border border-hairline bg-card sm:block"
            >
              <div className="flex w-[260px] flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{t("filterButton")}</h3>
                  {activeFilterCount > 0 && (
                    <button type="button" onClick={clearFilters} className="text-xs font-medium text-violet-ink hover:underline">
                      {t("clearFilters")}
                    </button>
                  )}
                </div>

                <FilterGroup
                  label={t("scopeLabel")}
                  icon={<FileText className="size-3.5" aria-hidden />}
                  items={SCOPES.map((s) => ({ label: scopeLabel[s], value: s }))}
                  value={scope}
                  onChange={(next) => updateQuery({ scope: next })}
                />

                <FilterGroup
                  label={t("sortPlaceholder")}
                  icon={<SortDesc className="size-3.5" aria-hidden />}
                  items={SORTS.map((s) => ({ label: sortLabel[s], value: s }))}
                  value={sort}
                  onChange={(next) => updateQuery({ sort: next })}
                />

                <FilterGroup
                  label={t("datePlaceholder")}
                  icon={<Calendar className="size-3.5" aria-hidden />}
                  items={DATES.map((d) => ({ label: dateLabel[d], value: d }))}
                  value={date}
                  onChange={(next) => updateQuery({ date: next })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* versi mobile: panel filter tampil penuh di atas grid, bukan sidebar sempit */}
        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              key="filter-panel-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-hidden rounded-panel border border-hairline bg-card sm:hidden"
            >
              <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">{t("filterButton")}</h3>
                  {activeFilterCount > 0 && (
                    <button type="button" onClick={clearFilters} className="text-xs font-medium text-violet-ink hover:underline">
                      {t("clearFilters")}
                    </button>
                  )}
                </div>

                <FilterGroup
                  label={t("scopeLabel")}
                  icon={<FileText className="size-3.5" aria-hidden />}
                  items={SCOPES.map((s) => ({ label: scopeLabel[s], value: s }))}
                  value={scope}
                  onChange={(next) => updateQuery({ scope: next })}
                />
                <FilterGroup
                  label={t("sortPlaceholder")}
                  icon={<SortDesc className="size-3.5" aria-hidden />}
                  items={SORTS.map((s) => ({ label: sortLabel[s], value: s }))}
                  value={sort}
                  onChange={(next) => updateQuery({ sort: next })}
                />
                <FilterGroup
                  label={t("datePlaceholder")}
                  icon={<Calendar className="size-3.5" aria-hidden />}
                  items={DATES.map((d) => ({ label: dateLabel[d], value: d }))}
                  value={date}
                  onChange={(next) => updateQuery({ date: next })}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DocumentSearchContext.Provider value={deferredSearch.trim().toLowerCase()}>
          <div className="min-w-0 w-full sm:flex-1">{children}</div>
        </DocumentSearchContext.Provider>
      </div>
    </>
  );
}
