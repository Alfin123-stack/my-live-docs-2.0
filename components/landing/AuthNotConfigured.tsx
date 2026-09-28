export function AuthNotConfigured() {
  return (
    <div className="w-full rounded-cards border border-hairline bg-card p-6 text-center shadow-adora">
      <p className="font-display text-lg font-bold text-heading">
        Auth belum dikonfigurasi
      </p>
      <p className="mt-2 text-body-sm text-body">
        Isi <code className="rounded bg-recessed px-1.5 py-0.5 text-[13px]">
          MONGODB_URI
        </code>{" "}
        dan{" "}
        <code className="rounded bg-recessed px-1.5 py-0.5 text-[13px]">
          AUTH_SECRET
        </code>{" "}
        di file <code className="rounded bg-recessed px-1.5 py-0.5 text-[13px]">.env</code> dulu
        (lihat <code className="rounded bg-recessed px-1.5 py-0.5 text-[13px]">.env.example</code>)
        untuk mengaktifkan sign-in/sign-up (email/password via Auth.js + MongoDB).
      </p>
    </div>
  );
}

/** Varian halaman penuh, dipakai di layout yang butuh auth (mis. /documents). */
export function AuthNotConfiguredPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-5 py-16">
      <div className="w-full max-w-[420px]">
        <AuthNotConfigured />
      </div>
    </main>
  );
}
