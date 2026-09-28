"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

import type { ActionErrorCode } from "@/lib/actions/result";

/** Terjemahan pesan untuk kode error Server Action (fungsi stabil antar-render). */
export function useActionErrorMessage() {
  const t = useTranslations("Errors");
  return useCallback((code: ActionErrorCode) => t(code), [t]);
}
