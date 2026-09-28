import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Wrapper Next.js APIs (Link, redirect, usePathname, useRouter) yang otomatis
// sadar locale — pakai ini di seluruh app, bukan next/navigation langsung.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
