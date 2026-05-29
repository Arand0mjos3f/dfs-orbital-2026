import { useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useGroupStore } from '../store/groupStore';

const cardClass = 'rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);

  const displayName = user?.username || user?.name || 'Guest';

  const stats = useMemo(
    () => ({
      totalGroups: groups.length,
      owedToYou: 0,
      youOwe: 0,
    }),
    [groups.length]
  );

  return (
    <div className="min-h-full bg-[#F8FAFC] px-5 pb-8 pt-7">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">Welcome back</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Hello, {displayName}
          </h1>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-sky-100 text-sm font-extrabold text-[#4F46E5] shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
      </header>

      <section className="mb-6 rounded-[24px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-slate-400">Total Balance</p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-400">You are owed</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#10B981]">
              ${stats.owedToYou.toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-400">You owe</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#EF4444]">
              ${stats.youOwe.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-2 gap-3">
        <div className={cardClass}>
          <p className="text-sm font-semibold text-slate-400">Groups</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{stats.totalGroups}</p>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-semibold text-slate-400">Status</p>
          <p className="mt-2 text-lg font-extrabold text-[#10B981]">Ready</p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-slate-900">
          Pending Balances
        </h2>

        <div className={`${cardClass} text-center`}>
          <p className="text-sm font-semibold text-slate-400">
            No live balance data yet. This section will connect to the debt summary API.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-extrabold tracking-tight text-slate-900">
          Recent Activity
        </h2>

        <div className={`${cardClass} text-center`}>
          <p className="text-sm font-semibold text-slate-400">
            No activity yet. Expenses, splits, and settlements will appear here after the activity
            API is connected.
          </p>
        </div>
      </section>
    </div>
  );
}
