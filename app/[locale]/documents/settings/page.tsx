import { getOptionalUser } from "@/lib/auth/session";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

import AccountSettingsClient from "./AccountSettingsClient";

const AccountSettingsPage = async () => {
  const locale = await getLocale();
  const user = await getOptionalUser();
  if (!user) return redirect({ href: "/sign-in", locale });

  return (
    <main className="min-h-screen w-full bg-canvas px-4 py-10 sm:px-8">
      <AccountSettingsClient name={user.name} email={user.email} />
    </main>
  );
};

export default AccountSettingsPage;
