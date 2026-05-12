export function AdminLoadingScreen() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 select-none">
      {/* Logo mark */}
      <div className="flex flex-col items-center gap-4">
        {/* Animated ring around logo */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute h-24 w-24 rounded-full border border-slate-200"
            style={{ animation: "ag-ring-pulse 2.4s ease-in-out infinite" }}
          />
          <div
            className="absolute h-20 w-20 rounded-full border border-slate-100"
            style={{ animation: "ag-ring-pulse 2.4s ease-in-out 0.4s infinite" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.anita-gelato.com/wp-content/uploads/2023/05/logo.svg"
            alt="Anita Gelato"
            width={52}
            height={52}
            className="relative z-10"
            style={{ animation: "ag-logo-breathe 2.4s ease-in-out infinite" }}
          />
        </div>

        {/* Brand wordmark */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="text-[9px] font-semibold uppercase tracking-[0.35em] text-slate-400"
            style={{ animation: "ag-fade-in 0.6s ease both" }}
          >
            Anita
          </span>
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500"
            style={{ animation: "ag-fade-in 0.6s 0.1s ease both" }}
          >
            Menu Console
          </span>
        </div>
      </div>

      {/* Animated progress bar */}
      <div className="relative h-px w-32 overflow-hidden rounded-full bg-slate-200">
        <div
          className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-slate-400"
          style={{ animation: "ag-bar-slide 1.6s ease-in-out infinite" }}
        />
      </div>

      <style>{`
        @keyframes ag-ring-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.06); }
        }
        @keyframes ag-logo-breathe {
          0%, 100% { opacity: 0.7; transform: scale(0.97); }
          50%       { opacity: 1;   transform: scale(1.03); }
        }
        @keyframes ag-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ag-bar-slide {
          0%   { left: -50%; }
          100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}
