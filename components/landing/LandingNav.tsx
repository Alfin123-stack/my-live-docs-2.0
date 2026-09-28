"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn, getInitials } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Asterisk } from "./Doodles";
import { Logo } from "./Logo";

type MenuKey = "product" | "resources";

// Nama namespace terjemahan tidak selalu sama dengan MenuKey ("resources" plural di
// sini vs "resourceItems" singular di messages/*.json, dipakai juga oleh Footer.tsx) —
// map eksplisit di sini menghindari salah tebak nama key seperti bug sebelumnya.
const ITEMS_NS: Record<MenuKey, string> = { product: "product", resources: "resource" };

const V = "var(--color-electric-violet)";
const M = "var(--color-magenta-pulse)";
const C = "var(--color-neon-cyan)";
const L = "var(--color-lime-pop)";

const MENUS: Record<MenuKey, { key: string; href: string; color: string }[]> = {
  product: [
    { key: "cursors", href: "#features", color: V },
    { key: "comments", href: "#comments", color: M },
    { key: "access", href: "#access", color: V },
    { key: "dashboard", href: "#dashboard", color: C },
  ],
  resources: [
    { key: "how", href: "#start", color: V },
    { key: "privacy", href: "#privacy", color: M },
    { key: "stack", href: "#stack", color: L },
  ],
};

const linkCls =
  "rounded-full px-3.5 py-2 text-[15px] font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet";

export function LandingNav() {
  const t = useTranslations("Landing.nav");
  const tAuth = useTranslations("Auth");
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated" && !!session?.user;
  const userInitials = getInitials(session?.user?.name || session?.user?.email || "?");
  const [open, setOpen] = useState<MenuKey | null>(null);
  const [mobile, setMobile] = useState(false);
  const [showCta, setShowCta] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Tombol "Get started" baru muncul di pill setelah hero di-scroll (seperti referensi).
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setShowCta(v > 240));

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null);
        setMobile(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hoverOpen = (k: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(k);
  };
  const hoverClose = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 140);
  };

  const cta = (
    <Link
      href="/sign-up"
      className="rounded-[10px] bg-violet px-[18px] py-2 text-[15px] font-semibold text-on-accent transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
    >
      {t("getStarted")}
    </Link>
  );

  // Login-aware: sudah login → tombol "Dashboard" (bukan CTA get-started yang cuma
  // muncul setelah scroll) + avatar/dropdown (nama, pengaturan akun, keluar) —
  // bukan lagi tombol Login yang tidak relevan buat orang yang sudah masuk.
  const dashboardCta = (
    <Link
      href="/documents"
      className="inline-flex items-center gap-1.5 rounded-[10px] bg-violet px-[18px] py-2 text-[15px] font-semibold text-on-accent transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
    >
      <LayoutDashboard className="size-4" aria-hidden />
      {t("openDashboard")}
    </Link>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={session?.user?.name || session?.user?.email || tAuth("account")}
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-recessed text-[13px] font-bold text-ink transition-transform hover:scale-105"
      >
        {userInitials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="truncate text-[13px] font-semibold text-ink">{session?.user?.name}</p>
          <p className="truncate text-[12px] text-muted">{session?.user?.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/documents/settings" className="flex items-center">
            <Settings className="mr-2 size-4" aria-hidden /> {tAuth("accountSettings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 size-4" aria-hidden /> {tAuth("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-[16px] z-50 flex justify-center px-3">
      <nav
        ref={navRef}
        aria-label="Main"
        className="relative flex items-center rounded-full border border-hairline py-2 pl-5 pr-2.5 shadow-adora backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--surface-elevated-card) 92%, transparent)" }}
      >
        <Link href="/" aria-label="LiveDocs" className="mr-3 flex items-center md:mr-5">
          <Logo />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center md:flex">
          {(["product", "resources"] as MenuKey[]).map((k) => (
            <div
              key={k}
              className="relative"
              onMouseEnter={() => hoverOpen(k)}
              onMouseLeave={hoverClose}
            >
              <button
                type="button"
                aria-expanded={open === k}
                aria-haspopup="true"
                onClick={() => setOpen(open === k ? null : k)}
                className={cn(linkCls, "inline-flex items-center gap-1")}
              >
                {t(k)}
                <ChevronDown
                  className={cn("size-[14px] transition-transform", open === k && "rotate-180")}
                />
              </button>
              <AnimatePresence>
                {open === k && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-0 top-full z-10 mt-2 min-w-[230px] rounded-[20px] border border-hairline bg-card p-2.5 shadow-adora"
                  >
                    {MENUS[k].map((item) => (
                      <li key={item.key}>
                        <a
                          href={item.href}
                          onClick={() => setOpen(null)}
                          className="flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] font-medium text-ink-soft transition-colors hover:bg-recessed hover:text-ink"
                        >
                          <Asterisk className="size-[14px]" color={item.color} />
                          {t(`${ITEMS_NS[k]}Items.${item.key}`)}
                        </a>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          ))}
          <a href="#use-cases" className={linkCls}>
            {t("useCases")}
          </a>
          {!isAuthed && (
            <Link href="/sign-in" className={linkCls}>
              {t("login")}
            </Link>
          )}

          <span aria-hidden className="mx-1.5 h-5 w-px bg-hairline" />

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-0.5 rounded-full border border-hairline bg-recessed p-1"
          >
            <LocaleSwitcher variant="bare" />
            <span aria-hidden className="h-4 w-px bg-hairline" />
            <ThemeToggle variant="bare" />
          </motion.div>

          {isAuthed && <span aria-hidden className="mx-1.5 h-5 w-px bg-hairline" />}
          {isAuthed && userMenu}
        </div>

        {/* Tombol CTA: tumbuh dari lebar 0 sehingga pill melebar mulus.
            Untuk yang sudah login, tombol Dashboard SELALU tampil (bukan cuma
            setelah scroll seperti "Get started") — bukan CTA pendaftaran lagi. */}
        <AnimatePresence initial={false}>
          {(isAuthed || showCta) && (
            <motion.div
              key={isAuthed ? "dashboard-cta" : "cta"}
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 6 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden whitespace-nowrap"
            >
              {isAuthed ? dashboardCta : cta}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile */}
        <button
          type="button"
          aria-label={mobile ? t("closeMenu") : t("openMenu")}
          aria-expanded={mobile}
          onClick={() => setMobile((v) => !v)}
          className="ml-2 flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-recessed md:hidden"
        >
          {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <AnimatePresence>
          {mobile && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 top-full mt-2 w-[min(88vw,340px)] rounded-[24px] border border-hairline bg-card p-3 shadow-adora md:hidden"
            >
              {(["product", "resources"] as MenuKey[]).map((k) => (
                <div key={k} className="px-2 pb-2 pt-1">
                  <p className="px-2 pb-1 text-[12px] font-semibold uppercase tracking-wide text-muted">
                    {t(k)}
                  </p>
                  {MENUS[k].map((item) => (
                    <a
                      key={item.key}
                      href={item.href}
                      onClick={() => setMobile(false)}
                      className="flex items-center gap-3 rounded-[12px] px-2 py-2.5 text-[15px] font-medium text-ink-soft hover:bg-recessed"
                    >
                      <Asterisk className="size-[14px]" color={item.color} />
                      {t(`${ITEMS_NS[k]}Items.${item.key}`)}
                    </a>
                  ))}
                </div>
              ))}
              <div className="flex flex-col gap-2 border-t border-hairline px-2 pt-3">
                {isAuthed ? (
                  <>
                    <div className="flex items-center gap-3 px-2 py-1">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-recessed text-[13px] font-bold text-ink">
                        {userInitials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-semibold text-ink">
                          {session?.user?.name}
                        </p>
                        <p className="truncate text-[12px] text-muted">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/documents"
                      onClick={() => setMobile(false)}
                      className="flex items-center justify-center gap-1.5 rounded-[10px] bg-violet px-[18px] py-2.5 text-center text-[15px] font-semibold text-on-accent"
                    >
                      <LayoutDashboard className="size-4" aria-hidden />
                      {t("openDashboard")}
                    </Link>
                    <Link
                      href="/documents/settings"
                      onClick={() => setMobile(false)}
                      className="flex items-center justify-center gap-1.5 rounded-[10px] border border-hairline px-[18px] py-2.5 text-center text-[15px] font-semibold text-ink"
                    >
                      <Settings className="size-4" aria-hidden />
                      {tAuth("accountSettings")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center justify-center gap-1.5 rounded-[10px] px-[18px] py-2.5 text-center text-[15px] font-semibold text-ink-soft transition-colors hover:bg-recessed hover:text-ink"
                    >
                      <LogOut className="size-4" aria-hidden />
                      {tAuth("signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      className="rounded-[10px] border border-hairline px-[18px] py-2.5 text-center text-[15px] font-semibold text-ink"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/sign-up"
                      className="rounded-[10px] bg-violet px-[18px] py-2.5 text-center text-[15px] font-semibold text-on-accent"
                    >
                      {t("getStarted")}
                    </Link>
                  </>
                )}
                <div className="flex items-center justify-end gap-0.5 self-end rounded-full border border-hairline bg-recessed p-1">
                  <LocaleSwitcher variant="bare" />
                  <span aria-hidden className="h-4 w-px bg-hairline" />
                  <ThemeToggle variant="bare" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
