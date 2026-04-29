export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-9 w-72 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
