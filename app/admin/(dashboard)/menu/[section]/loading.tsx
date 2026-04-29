export default function AdminMenuSectionLoading() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
          <div className="h-8 w-64 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="h-[420px] animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
