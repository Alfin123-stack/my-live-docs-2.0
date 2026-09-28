import { AuthShell } from "@/components/landing/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthNotConfigured } from "@/components/landing/AuthNotConfigured";
import { hasAuthEnv } from "@/lib/auth-env";

const SignUpPage = async () => {
  return (
    <AuthShell wide={hasAuthEnv}>
      {hasAuthEnv ? <AuthCard initialMode="sign-up" /> : <AuthNotConfigured />}
    </AuthShell>
  );
};

export default SignUpPage;
