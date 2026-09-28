"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { btnPrimary } from "@/components/landing/ui";
import {
  forgotPasswordSchema,
  PASSWORD_MIN_LENGTH,
  resetPasswordSchema,
} from "@/lib/auth/schemas";

const inputClass =
  "h-11 w-full rounded-control border border-hairline bg-canvas px-3 text-[15px] text-ink-soft placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet";

function useValidationMessage() {
  const t = useTranslations("Auth");
  return (code: string | undefined) =>
    code && t.has(`validation.${code}`) ? t(`validation.${code}`) : t("errorGeneric");
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full rounded-panel border border-hairline bg-card p-6 shadow-adora sm:p-8">
      <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

function Notice({ tone, children }: { tone: "info" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "text-sm text-magenta"
          : "rounded-control border border-hairline bg-recessed px-3 py-2 text-sm text-ink"
      }
    >
      {children}
    </p>
  );
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  return { status: res.status, ok: res.ok && data?.ok === true, error: data?.error };
}

/** Lupa password: respons sama untuk email terdaftar / tidak (anti-enumerasi). */
export function ForgotPasswordForm() {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const validationMessage = useValidationMessage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(validationMessage(parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    try {
      const result = await postJson("/api/auth/forgot-password", { ...parsed.data, locale });
      if (result.status === 429) setError(t("errorRateLimited"));
      else if (!result.ok) setError(validationMessage(result.error));
      else setSent(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("forgotTitle")}>
      <p>{t("forgotBody")}</p>
      {sent ? (
        <Notice tone="info">{t("forgotSent")}</Notice>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">{t("emailLabel")}</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full disabled:opacity-60`}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> {t("forgotLoading")}
              </>
            ) : (
              t("forgotButton")
            )}
          </button>
        </form>
      )}
      <Link href="/sign-in" className="inline-block text-sm text-violet-ink hover:underline">
        {t("backToSignIn")}
      </Link>
    </Card>
  );
}

export function ResetPasswordForm({ token }: { token: string | null }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const validationMessage = useValidationMessage();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <Card title={t("resetTitle")}>
        <Notice tone="error">{t("validation.token_invalid")}</Notice>
        <Link href="/forgot-password" className="inline-block text-sm text-violet-ink hover:underline">
          {t("forgotTitle")}
        </Link>
      </Card>
    );
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t("validation.password_mismatch"));
      return;
    }
    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) {
      setError(validationMessage(parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    try {
      const result = await postJson("/api/auth/reset-password", { ...parsed.data, locale });
      if (result.status === 429) setError(t("errorRateLimited"));
      else if (!result.ok) setError(validationMessage(result.error));
      else setDone(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("resetTitle")}>
      {done ? (
        <>
          <Notice tone="info">{t("resetDone")}</Notice>
          <Link href="/sign-in" className={`${btnPrimary} w-full`}>
            {t("signInButton")}
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <p>{t("resetBody", { min: PASSWORD_MIN_LENGTH })}</p>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">{t("newPasswordLabel")}</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">{t("confirmPasswordLabel")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
              required
            />
          </label>
          {error && <Notice tone="error">{error}</Notice>}
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full disabled:opacity-60`}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> {t("resetLoading")}
              </>
            ) : (
              t("resetButton")
            )}
          </button>
        </form>
      )}
    </Card>
  );
}

/** Konfirmasi lewat tombol (POST), bukan otomatis saat halaman dibuka — kebal terhadap pemindai tautan email. */
export function VerifyEmailPanel({ token }: { token: string | null }) {
  const t = useTranslations("Auth");
  const validationMessage = useValidationMessage();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      const result = await postJson("/api/auth/verify-email", { token });
      if (result.status === 429) setError(t("errorRateLimited"));
      else if (!result.ok) setError(validationMessage(result.error));
      else setDone(true);
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={t("verifyTitle")}>
      {!token ? (
        <Notice tone="error">{t("validation.token_invalid")}</Notice>
      ) : done ? (
        <>
          <Notice tone="info">{t("verifyDone")}</Notice>
          <Link href="/sign-in" className={`${btnPrimary} w-full`}>
            {t("signInButton")}
          </Link>
        </>
      ) : (
        <>
          <p>{t("verifyBody")}</p>
          {error && <Notice tone="error">{error}</Notice>}
          <button type="button" onClick={verify} disabled={loading} className={`${btnPrimary} w-full disabled:opacity-60`}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> {t("verifyLoading")}
              </>
            ) : (
              t("verifyButton")
            )}
          </button>
        </>
      )}
    </Card>
  );
}
