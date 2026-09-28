import { auth } from "@/auth";
import { getLiveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { isSameOrigin } from "@/lib/security/request";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return new Response("Forbidden", { status: 403 });
  }

  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  // Identitas Liveblocks = email (huruf kecil) karena `usersAccesses` di-key oleh email.
  // Ini aman HANYA karena email wajib terverifikasi sebelum akun bisa login.
  const info = {
    id: session.user.id,
    name: session.user.name ?? email,
    email,
    avatar: "",
    color: getUserColor(email),
  };

  const { status, body } = await getLiveblocks().identifyUser(
    { userId: email, groupIds: [] },
    { userInfo: info }
  );

  return new Response(body, { status, headers: { "Cache-Control": "no-store" } });
}
