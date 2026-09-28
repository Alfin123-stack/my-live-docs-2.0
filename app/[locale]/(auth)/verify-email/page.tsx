import { AuthShell } from "@/components/landing/AuthShell";
import { VerifyEmailPanel } from "@/components/auth/AuthForms";
import { AuthNotConfigured } from "@/components/landing/AuthNotConfigured";
import { hasAuthEnv } from "@/lib/auth-env";

export default async function VerifyEmailPage({ searchParams }: SearchParamProps) {
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : null;

  return (
    <AuthShell>{hasAuthEnv ? <VerifyEmailPanel token={value} /> : <AuthNotConfigured />}</AuthShell>
  );
}
