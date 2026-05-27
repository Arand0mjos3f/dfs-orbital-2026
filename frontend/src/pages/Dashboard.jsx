import { useAuthStore } from '../store/useAuthStore';

const avatarClass =
  'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 text-lg shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

const cardClass = 'rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">Welcome back</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Hello, {user?.username || 'Justin'} 🦁
          </h1>
        </div>
        <div className={avatarClass}>🎓</div>
      </header>

      <section className="mb-6 rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-slate-400">Total Balance</p>
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-400">You are owed</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-[#10B981]">$45.50</p>
          </div>
          <div className="h-px bg-white/10" />
          <div>
            <p className="text-sm font-medium text-slate-400">You owe</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-[#EF4444]">$12.00</p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-slate-900">
          Pending Balances
        </h2>

        <div className="space-y-3">
          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className={avatarClass}>A</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#EF4444]">You owe Alice $15.00</p>
                <p className="mt-1 text-sm font-medium text-slate-400">Due from supper split</p>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-[#4F46E5] px-4 py-2 text-xs font-extrabold text-[#4F46E5]"
              >
                Mark as Paid
              </button>
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className={avatarClass}>B</div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#10B981]">Bob owes you $12.00</p>
                <p className="mt-1 text-sm font-medium text-slate-400">Project dinner balance</p>
              </div>
              <button
                type="button"
                className="rounded-2xl bg-[#4F46E5] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
              >
                Remind
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-slate-900">
          Recent Activity
        </h2>

        <div className={`${cardClass} space-y-4`}>
          {[
            ['Grab to Kent Ridge', 'Justin paid $15.00'],
            ['Super Snacks Supper', 'Alice paid $8.50'],
            ['Figma Subscription', 'Justin paid $20.00'],
          ].map(([title, subtitle]) => (
            <div key={title} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-sm font-medium text-slate-400">{subtitle}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
