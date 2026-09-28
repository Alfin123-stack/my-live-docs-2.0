"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, Lock, Mail, User } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { registerSchema, loginSchema, PASSWORD_MIN_LENGTH } from "@/lib/auth/schemas";
import { safeRedirectPath } from "@/lib/auth/redirect";

type Mode = "sign-in" | "sign-up";

/** Kode validasi dari schema/API → teks terjemahan (fallback ke pesan umum). */
function useValidationMessage() {
  const t = useTranslations("Auth");
  return (code: string | undefined) =>
    code && t.has(`validation.${code}`) ? t(`validation.${code}`) : t("errorGeneric");
}

/**
 * Diadaptasi dari referensi "split-panel sliding card" — animasi & struktur
 * dipertahankan, tapi:
 * - Gradient ungu generik diganti token Adora (electric-violet → midnight-plum)
 * - Font Inter hardcode diganti var(--font-schibsted)/var(--font-plus-jakarta-sans)
 * - Icon emoji diganti lucide-react
 * - Social login dihapus (belum dipakai)
 * - Form sungguhan: submit ke Auth.js (sign-in) / /api/auth/register (sign-up),
 *   dengan state loading & pesan error
 */
export function AuthCard({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const isSignUp = mode === "sign-up";

  return (
    <div className="auth-card-switch">
      <AuthCardStyles />

      {/* `sign-up-mode` HARUS di elemen .container: semua selector CSS di bawah memakai
          `.container.sign-up-mode`. Kalau class ini ditaruh di wrapper luar, tombol
          "Sign up" hanya mengubah state tanpa efek visual dan form sign-up tetap
          tersembunyi (opacity 0, z-index di bawah form sign-in). */}
      <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
        <div className="forms-container">
          <div className="signin-signup">
            <SignInForm active={!isSignUp} />
            <SignUpForm active={isSignUp} />
          </div>
        </div>

        <div className="panels-container">
          <Panel side="left" active={!isSignUp} onSwitch={() => setMode("sign-up")} />
          <Panel side="right" active={isSignUp} onSwitch={() => setMode("sign-in")} />
        </div>
      </div>
    </div>
  );
}

function Panel({
  side,
  active,
  onSwitch,
}: {
  side: "left" | "right";
  active: boolean;
  onSwitch: () => void;
}) {
  const t = useTranslations("Auth");
  const title = side === "left" ? t("newHereTitle") : t("oneOfUsTitle");
  const body = side === "left" ? t("newHereBody") : t("oneOfUsBody");
  const cta = side === "left" ? t("newHereCta") : t("oneOfUsCta");

  return (
    <div className={`panel ${side}-panel`} data-active={active}>
      <div className="content">
        <h3>{title}</h3>
        <p>{body}</p>
        <button type="button" className="btn transparent" onClick={onSwitch}>
          {cta}
        </button>
      </div>
    </div>
  );
}

function SignInForm({ active }: { active: boolean }) {
  const t = useTranslations("Auth");
  const validationMessage = useValidationMessage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(validationMessage(parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      // Respons gagal SENGAJA seragam (password salah / email belum terverifikasi /
      // terlalu banyak percobaan) supaya tidak bisa dipakai menebak akun.
      if (result?.error) {
        setError(t("errorInvalidCredentials"));
        return;
      }

      // Kembali ke halaman yang dituju sebelum diminta login — hanya path internal yang lolos allowlist.
      const target =
        safeRedirectPath(new URLSearchParams(window.location.search).get("redirect_url")) ??
        "/documents";
      router.push(target);
      router.refresh();
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`sign-in-form ${active ? "is-active" : ""}`}
      onSubmit={onSubmit}
      aria-hidden={!active}
      inert={!active}
    >
      <h2 className="title">{t("signInTitle")}</h2>

      <label className="input-field">
        <Mail size={18} strokeWidth={2} aria-hidden />
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailLabel")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="input-field">
        <Lock size={18} strokeWidth={2} aria-hidden />
        <input
          type="password"
          placeholder={t("passwordSignInPlaceholder")}
          aria-label={t("passwordLabel")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <Link href="/forgot-password" className="form-link">
        {t("forgotPasswordLink")}
      </Link>

      <button type="submit" className="btn solid" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} /> {t("signInLoading")}
          </>
        ) : (
          t("signInButton")
        )}
      </button>
    </form>
  );
}

function SignUpForm({ active }: { active: boolean }) {
  const t = useTranslations("Auth");
  const locale = useLocale();
  const validationMessage = useValidationMessage();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setError(validationMessage(parsed.error.issues[0]?.message));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, locale }),
      });

      if (res.status === 429) {
        setError(t("errorRateLimited"));
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(validationMessage(data?.error));
        return;
      }

      // Respons sukses SELALU sama, baik email baru maupun sudah terdaftar.
      // Akun baru aktif setelah pemilik email mengklik tautan verifikasi.
      setSentTo(parsed.data.email);
      setPassword("");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`sign-up-form ${active ? "is-active" : ""}`}
      onSubmit={onSubmit}
      aria-hidden={!active}
      inert={!active}
    >
      <h2 className="title">{t("signUpTitle")}</h2>

      {sentTo && (
        <p className="form-notice" role="status">
          {t("checkEmailNotice", { email: sentTo })}
        </p>
      )}

      <label className="input-field">
        <User size={18} strokeWidth={2} aria-hidden />
        <input
          type="text"
          placeholder={t("namePlaceholder")}
          aria-label={t("nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </label>

      <label className="input-field">
        <Mail size={18} strokeWidth={2} aria-hidden />
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          aria-label={t("emailLabel")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </label>

      <label className="input-field">
        <Lock size={18} strokeWidth={2} aria-hidden />
        <input
          type="password"
          placeholder={t("passwordPlaceholder")}
          aria-label={t("passwordLabel")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="btn solid" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} /> {t("signUpLoading")}
          </>
        ) : (
          t("signUpButton")
        )}
      </button>
    </form>
  );
}

/**
 * CSS mentah (bukan Tailwind) sengaja dipertahankan seperti referensi aslinya
 * — animasi blob/slide-nya butuh transition timeline presisi yang lebih
 * mudah ditulis lewat CSS custom drpd di-translate ke utility classes.
 * Semua warna/font di sini pakai CSS var Adora, jadi otomatis benar di
 * light & dark mode.
 */
function AuthCardStyles() {
  return (
    <style>{`
      .auth-card-switch,
      .auth-card-switch * {
        box-sizing: border-box;
      }

      .auth-card-switch {
        font-family: var(--font-plus-jakarta-sans), var(--font-sans), sans-serif;
        width: 100%;
        display: flex;
        justify-content: center;
      }

      .auth-card-switch .container {
        position: relative;
        width: 100%;
        max-width: 880px;
        min-height: 560px;
        background: var(--surface-elevated-card);
        border: 1px solid var(--border-hairline);
        border-radius: var(--radius-cards);
        box-shadow: var(--shadow-soft);
        overflow: hidden;
      }

      .auth-card-switch .forms-container {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }

      .auth-card-switch .signin-signup {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        left: 75%;
        width: 50%;
        transition: 1s 0.7s ease-in-out;
        display: grid;
        grid-template-columns: 1fr;
        z-index: 5;
      }

      .auth-card-switch form {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        padding: 2rem 3rem;
        transition: all 0.2s 0.7s;
        overflow: hidden;
        grid-column: 1 / 2;
        grid-row: 1 / 2;
      }

      .auth-card-switch form.sign-up-form {
        opacity: 0;
        z-index: 1;
      }

      .auth-card-switch form.sign-in-form {
        z-index: 2;
      }

      .auth-card-switch .container.sign-up-mode form.sign-up-form {
        opacity: 1;
        z-index: 2;
      }

      .auth-card-switch .container.sign-up-mode form.sign-in-form {
        opacity: 0;
        z-index: 1;
      }

      .auth-card-switch form[aria-hidden="true"] * {
        pointer-events: none;
      }

      .auth-card-switch .title {
        font-family: var(--font-schibsted), var(--font-sans), sans-serif;
        font-size: 1.9rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: var(--text-heading);
        margin-bottom: 6px;
      }

      .auth-card-switch .input-field {
        max-width: 340px;
        width: 100%;
        background-color: var(--surface-recessed-surface);
        margin: 9px 0;
        height: 52px;
        border-radius: var(--radius-input);
        display: grid;
        grid-template-columns: 42px 1fr;
        align-items: center;
        padding: 0 0.9rem;
        position: relative;
        transition: box-shadow 0.2s ease, background-color 0.2s ease;
        border: 1px solid transparent;
      }

      .auth-card-switch .input-field:focus-within {
        border-color: var(--border-focus);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-electric-violet) 20%, transparent);
      }

      .auth-card-switch .input-field svg {
        color: var(--text-muted);
      }

      .auth-card-switch .input-field input {
        background: none;
        outline: none;
        border: none;
        line-height: 1;
        font-weight: 500;
        font-size: 0.95rem;
        color: var(--text-body);
        width: 100%;
        font-family: inherit;
      }

      .auth-card-switch .input-field input::placeholder {
        color: var(--text-muted);
        font-weight: 400;
      }

      .auth-card-switch .form-notice {
        max-width: 340px;
        width: 100%;
        color: var(--text-heading);
        background: var(--surface-recessed-surface);
        border: 1px solid var(--border-hairline);
        border-radius: 12px;
        font-size: 0.85rem;
        line-height: 1.5;
        margin: 4px 0 0;
        padding: 10px 12px;
        text-align: left;
      }

      .auth-card-switch .form-link {
        max-width: 340px;
        width: 100%;
        color: var(--color-electric-violet);
        font-size: 0.85rem;
        text-align: right;
        margin: 2px 0 0;
      }

      .auth-card-switch .form-link:hover {
        text-decoration: underline;
      }

      .auth-card-switch .form-error {
        max-width: 340px;
        width: 100%;
        color: var(--color-magenta-pulse);
        font-size: 0.85rem;
        margin: 4px 0 0;
        text-align: left;
      }

      .auth-card-switch .btn {
        width: 170px;
        background-color: var(--color-electric-violet);
        border: none;
        outline: none;
        height: 48px;
        border-radius: var(--radius-buttons);
        color: #fff;
        font-weight: 700;
        font-size: 0.9rem;
        margin: 16px 0 0;
        cursor: pointer;
        transition: filter 0.2s ease, transform 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .auth-card-switch .btn:hover {
        filter: brightness(1.1);
      }

      .auth-card-switch .btn:active {
        transform: scale(0.98);
      }

      .auth-card-switch .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .auth-card-switch .panels-container {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .auth-card-switch .panel {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: center;
        text-align: center;
        z-index: 6;
      }

      .auth-card-switch .left-panel {
        pointer-events: all;
        padding: 3rem 17% 2rem 12%;
      }

      .auth-card-switch .right-panel {
        pointer-events: none;
        padding: 3rem 12% 2rem 17%;
      }

      .auth-card-switch .panel .content {
        color: var(--text-on-accent);
        transition: transform 0.9s ease-in-out;
        transition-delay: 0.6s;
      }

      .auth-card-switch .panel h3 {
        font-family: var(--font-schibsted), var(--font-sans), sans-serif;
        font-weight: 700;
        line-height: 1.1;
        font-size: 1.4rem;
        margin-bottom: 10px;
      }

      .auth-card-switch .panel p {
        font-size: 0.9rem;
        opacity: 0.9;
        padding: 0.4rem 0 0.9rem;
      }

      .auth-card-switch .btn.transparent {
        margin: 0;
        background: none;
        border: 2px solid rgba(255, 255, 255, 0.7);
        width: 130px;
        height: 42px;
        font-weight: 700;
        font-size: 0.8rem;
      }

      .auth-card-switch .btn.transparent:hover {
        background: rgba(255, 255, 255, 0.14);
        filter: none;
        transform: translateY(-2px);
      }

      .auth-card-switch .right-panel .content {
        transform: translateX(800px);
      }

      .auth-card-switch .container.sign-up-mode:before {
        transform: translate(100%, -50%);
        right: 52%;
      }

      .auth-card-switch .container.sign-up-mode .left-panel .content {
        transform: translateX(-800px);
      }

      .auth-card-switch .container.sign-up-mode .signin-signup {
        left: 25%;
      }

      .auth-card-switch .container.sign-up-mode .right-panel .content {
        transform: translateX(0%);
      }

      .auth-card-switch .container.sign-up-mode .left-panel {
        pointer-events: none;
      }

      .auth-card-switch .container.sign-up-mode .right-panel {
        pointer-events: all;
      }

      .auth-card-switch .container:before {
        content: "";
        position: absolute;
        height: 2200px;
        width: 2200px;
        top: -10%;
        right: 48%;
        transform: translateY(-50%);
        background: linear-gradient(
          -45deg,
          var(--color-electric-violet) 0%,
          var(--color-midnight-plum) 100%
        );
        transition: 1.8s ease-in-out;
        border-radius: 50%;
        z-index: 6;
      }

      @media (max-width: 870px) {
        .auth-card-switch .container {
          min-height: 780px;
          height: auto;
        }
        .auth-card-switch .signin-signup {
          width: 100%;
          top: 95%;
          transform: translate(-50%, -100%);
          transition: 1s 0.8s ease-in-out;
        }
        .auth-card-switch .signin-signup,
        .auth-card-switch .container.sign-up-mode .signin-signup {
          left: 50%;
        }
        .auth-card-switch .panels-container {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 2fr 1fr;
        }
        .auth-card-switch .panel {
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          padding: 2.2rem 8%;
          grid-column: 1 / 2;
        }
        .auth-card-switch .right-panel {
          grid-row: 3 / 4;
        }
        .auth-card-switch .left-panel {
          grid-row: 1 / 2;
        }
        .auth-card-switch .panel .content {
          padding-right: 15%;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.8s;
        }
        .auth-card-switch .panel h3 {
          font-size: 1.15rem;
        }
        .auth-card-switch .panel p {
          font-size: 0.72rem;
          padding: 0.35rem 0;
        }
        .auth-card-switch .btn.transparent {
          width: 108px;
          height: 34px;
          font-size: 0.68rem;
        }
        .auth-card-switch .container:before {
          width: 1500px;
          height: 1500px;
          transform: translateX(-50%);
          left: 30%;
          bottom: 68%;
          right: initial;
          top: initial;
          transition: 2s ease-in-out;
        }
        .auth-card-switch .container.sign-up-mode:before {
          transform: translate(-50%, 100%);
          bottom: 32%;
          right: initial;
        }
        .auth-card-switch .container.sign-up-mode .left-panel .content {
          transform: translateY(-300px);
        }
        .auth-card-switch .container.sign-up-mode .right-panel .content {
          transform: translateY(0px);
        }
        .auth-card-switch .right-panel .content {
          transform: translateY(300px);
        }
        .auth-card-switch .container.sign-up-mode .signin-signup {
          top: 5%;
          transform: translate(-50%, 0);
        }
      }

      @media (max-width: 570px) {
        .auth-card-switch form {
          padding: 0 1.5rem;
        }
        .auth-card-switch .panel .content {
          padding: 0.5rem 1rem;
        }
      }
    `}</style>
  );
}
