export default function Debts() {
  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
      <header className="mb-6">
        <p className="text-sm font-semibold text-slate-400">CS2103T Project Team</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">Debts</h1>
      </header>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-extrabold tracking-tight text-slate-900">Raw Debts</h2>

        <div className="space-y-3 rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          {[
            'Justin pays Alice $10',
            'Alice pays Bob $10',
            'Bob pays Charlie $5',
            'Charlie pays Justin $5',
          ].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3"
            >
              <span className="text-sm font-bold text-slate-400">{item}</span>
              <span className="text-[#EF4444]">→</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-[#10B981]">
          Algorithm saved 3 transactions
        </div>

        <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Optimized by DFS</h2>

        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-bold text-[#10B981]">✓ Justin pays Bob $5</p>
        </div>

        <button
          type="button"
          className="mt-5 w-full rounded-2xl bg-[#4F46E5] px-4 py-4 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
        >
          Proceed to Settle
        </button>
      </section>
    </div>
  );
}
