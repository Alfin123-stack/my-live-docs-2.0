"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { AtSign, Bell, Lock, MessageSquare, Moon, Sun } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { ArtId } from "@/lib/landing-assets";
import { Painting } from "./art";
import { Avatar, Cursor, WRAP } from "./ui";

type Item = { title: string; body: string };
type MockCopy = { mentioned: string; shared: string; editor: string; viewer: string; only: string; invite: string };

const chip = "rounded-full border border-hairline bg-card px-3 py-1 text-[12px] font-semibold text-ink-soft";
const panel = "rounded-[14px] border border-hairline bg-card shadow-adora";

/** Setiap kartu: latar lukisan + mini-UI yang menggambarkan fiturnya. */
function Visual({ i, m }: { i: number; m: MockCopy }): ReactNode {
  switch (i) {
    case 0:
      return (
        <div className={`${panel} relative w-[78%] p-[16px]`}>
          <div className="space-y-2">
            <div className="h-[8px] w-[60%] rounded-full bg-[var(--text-heading)]" />
            {[92, 80, 86, 54].map((w, k) => (
              <div key={k} className="h-[5px] rounded-full bg-[var(--border-strong)]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <Cursor name="Sari" tone="pink" className="!left-[54%] !top-[30%]" />
          <Cursor name="Budi" tone="lime" className="!left-[16%] !top-[68%]" />
        </div>
      );
    case 1:
      return (
        <div className={`${panel} w-[80%] p-[16px]`}>
          <div className="flex items-center gap-2">
            <Avatar initial="S" tone="pink" className="size-[24px] text-[11px]" />
            <span className="text-[13px] font-bold text-ink">Sari</span>
            <MessageSquare className="ml-auto size-[14px] text-violet" />
          </div>
          <div className="mt-2 h-[6px] w-[86%] rounded-full bg-[var(--border-strong)]" />
          <div className="mt-1.5 h-[6px] w-[58%] rounded-full bg-[var(--border-strong)]" />
          <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
            <Avatar initial="B" tone="lime" className="size-[22px] text-[10px]" />
            <div className="h-[6px] w-[50%] rounded-full bg-[var(--border-strong)]" />
          </div>
        </div>
      );
    case 2:
      return (
        <div className={`${panel} w-[82%] space-y-3 p-[16px]`}>
          {[
            { n: "Sari", tone: "pink" as const, r: m.editor },
            { n: "Budi", tone: "lime" as const, r: m.viewer },
          ].map((p) => (
            <div key={p.n} className="flex items-center gap-3">
              <Avatar initial={p.n[0]} tone={p.tone} className="size-[30px] text-[12px]" />
              <span className="text-[13px] font-semibold text-ink">{p.n}</span>
              <span className={`${chip} ml-auto`}>{p.r}</span>
            </div>
          ))}
          <div className="rounded-[10px] border border-hairline px-3 py-2 text-[12px] text-muted">{m.invite}</div>
        </div>
      );
    case 3:
      return (
        <div className="w-[82%] space-y-2.5">
          <div className={`${panel} flex items-center gap-3 p-3`}>
            <span className="flex size-[30px] items-center justify-center rounded-full bg-[#ffaae6] text-[#21164c]">
              <AtSign className="size-[15px]" />
            </span>
            <p className="text-[12.5px] leading-snug text-ink-soft">
              <b className="text-ink">Sari</b> {m.mentioned}
            </p>
          </div>
          <div className={`${panel} flex items-center gap-3 p-3`}>
            <span className="flex size-[30px] items-center justify-center rounded-full bg-[#dfff9d] text-[#21164c]">
              <Bell className="size-[15px]" />
            </span>
            <p className="text-[12.5px] leading-snug text-ink-soft">
              <b className="text-ink">Budi</b> {m.shared}
            </p>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col items-center gap-3">
          <div className={`${panel} inline-flex p-1`}>
            <span className="rounded-full bg-violet px-[16px] py-1.5 text-[13px] font-bold text-on-accent">EN</span>
            <span className="rounded-full px-[16px] py-1.5 text-[13px] font-bold text-ink-soft">ID</span>
          </div>
          <div className={`${panel} inline-flex p-1`}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet px-3.5 py-1.5 text-on-accent">
              <Sun className="size-[14px]" />
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-ink-soft">
              <Moon className="size-[14px]" />
            </span>
          </div>
        </div>
      );
    default:
      return (
        <div className={`${panel} w-[78%] p-[16px]`}>
          <div className="flex items-center gap-2">
            <span className="flex size-[30px] items-center justify-center rounded-full bg-[#d9ccff] text-[#21164c]">
              <Lock className="size-[15px]" />
            </span>
            <span className="text-[13px] font-bold text-ink">{m.only}</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-[6px] w-[90%] rounded-full bg-[var(--border-strong)]" />
            <div className="h-[6px] w-[64%] rounded-full bg-[var(--border-strong)]" />
          </div>
        </div>
      );
  }
}

const ART_FOR: { art: ArtId; pos: string; zoom: number }[] = [
  { art: "lilies", pos: "20% 35%", zoom: 1.3 },
  { art: "reaper", pos: "60% 40%", zoom: 1.1 },
  { art: "sunrise", pos: "30% 50%", zoom: 1.25 },
  { art: "crau", pos: "70% 55%", zoom: 1.15 },
  { art: "cypresses", pos: "50% 30%", zoom: 1.2 },
  { art: "lilies", pos: "85% 70%", zoom: 1.6 },
];

export function FeatureGrid() {
  const t = useTranslations("Landing.features");
  const items = t.raw("items") as Item[];
  const m = t.raw("mock") as MockCopy;

  return (
    <section id="features" className={`${WRAP} scroll-mt-[96px] py-[40px] sm:py-[56px]`}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.article
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-[32px] border border-hairline bg-card p-3 shadow-adora"
          >
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[24px]">
              <Painting id={ART_FOR[i].art} position={ART_FOR[i].pos} zoom={ART_FOR[i].zoom} width={900} />
              <div className="relative flex w-full items-center justify-center">
                <Visual i={i} m={m} />
              </div>
            </div>
            <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
              <h3 className="font-display text-[22px] font-bold leading-[1.15] tracking-[-0.03em] text-ink">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-[1.6] text-ink-soft">{item.body}</p>
              <Link
                href="/sign-up"
                className="mt-5 w-fit rounded-[8px] border border-hairline px-3.5 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:bg-recessed"
              >
                {t("cta")}
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
