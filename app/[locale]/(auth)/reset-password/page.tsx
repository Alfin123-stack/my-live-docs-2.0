import { AuthShell } from "@/components/landing/AuthShell";
import { ResetPasswordForm } from "@/components/auth/AuthForms";
import { AuthNotConfigured } from "@/components/landing/AuthNotConfigured";
import { hasAuthEnv } from "@/lib/auth-env";

// Token dibaca dari query di server → halaman dinamis (bukan statis).
export default async function ResetPasswordPage({ searchParams }: SearchParamProps) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : null;

  return (
    <AuthShell>{hasAuthEnv ? <ResetPasswordForm token={value} /> : <AuthNotConfigured />}</AuthShell>
  );
}
