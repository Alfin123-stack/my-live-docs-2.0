"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const t = useTranslations("Auth");
  const { data: session } = useSession();
  const initials = getInitials(session?.user?.name, session?.user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={session?.user?.name || session?.user?.email || t("account")}
        className="touch-target flex size-9 shrink-0 items-center justify-center rounded-full border border-hairline bg-action text-[13px] font-bold text-on-accent shadow-adora transition-transform hover:scale-105"
      >
        {initials}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="truncate text-[13px] font-semibold text-ink">
            {session?.user?.name}
          </p>
          <p className="truncate text-[12px] text-muted">{session?.user?.email}</p>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/documents/settings" className="flex items-center">
            <Settings className="mr-2 size-4" aria-hidden /> {t("accountSettings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 size-4" aria-hidden /> {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
