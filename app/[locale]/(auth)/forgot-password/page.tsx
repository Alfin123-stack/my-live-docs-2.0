import { AuthShell } from "@/components/landing/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/AuthForms";
import { AuthNotConfigured } from "@/components/landing/AuthNotConfigured";
import { hasAuthEnv } from "@/lib/auth-env";

export default function ForgotPasswordPage() {
  return (
    <AuthShell>{hasAuthEnv ? <ForgotPasswordForm /> : <AuthNotConfigured />}</AuthShell>
  );
}
