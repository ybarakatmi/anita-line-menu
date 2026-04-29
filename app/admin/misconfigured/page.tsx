export default function AdminMisconfiguredPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-8 text-left shadow-sm">
        <h1 className="text-lg font-semibold text-amber-950">Supabase environment is not set</h1>
        <p className="mt-3 text-sm leading-relaxed text-amber-900/90">
          The admin console needs public Supabase credentials. Add these to{" "}
          <code className="rounded bg-white/80 px-1.5 py-0.5 text-xs text-amber-950">.env.local</code> in the project
          root, then restart <code className="rounded bg-white/80 px-1 py-0.5 text-xs">npm run dev</code>:
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1.5 font-mono text-xs text-amber-950/90">
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
        </ul>
        <p className="mt-4 text-sm text-amber-900/90">
          Optional for email invites from Settings:{" "}
          <code className="rounded bg-white/80 px-1 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code> (server only,
          never commit).
        </p>
      </div>
    </div>
  );
}
