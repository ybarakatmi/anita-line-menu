export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      <div className="h-[min(55vh,520px)] menu-skel" />
      <div className="sticky top-0 z-[300] flex h-[52px] items-center justify-between border-b-2 border-[var(--olive)] bg-[var(--warm-white)] px-5">
        <div className="menu-skel h-4 w-32 rounded" />
        <div className="menu-skel h-8 w-8 rounded" />
      </div>
      <div className="flex gap-2 overflow-hidden px-2 py-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="menu-skel h-10 min-w-[88px] shrink-0 rounded" />
        ))}
      </div>
      <div className="h-10 bg-[var(--olive)] menu-skel" />
      <div className="px-6 py-10">
        <div className="menu-skel mb-4 h-5 w-24 rounded" />
        <div className="menu-skel mb-2 h-12 w-64 max-w-xs rounded" />
        <div className="mt-6 flex gap-3 overflow-hidden pb-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="menu-skel h-[220px] w-[min(188px,52vw)] shrink-0 rounded"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
