import { AuthShell } from "@/components/landing/AuthShell";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthNotConfigured } from "@/components/landing/AuthNotConfigured";
import { hasAuthEnv } from "@/lib/auth-env";

const SignInPage = async () => {
  return (
    <AuthShell wide={hasAuthEnv}>
      {hasAuthEnv ? <AuthCard initialMode="sign-in" /> : <AuthNotConfigured />}
    </AuthShell>
  );
};

export default SignInPage;
