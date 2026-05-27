import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';

const testUserId = '16ab9e31-56f1-4afc-8d2f-09f45dfd57da';

const cardClass = 'rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

function AvatarStack({ members }) {
  const labels =
    members.length > 0 ? members : [{ user_id: 'J' }, { user_id: 'A' }, { user_id: 'B' }];
  const colors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-sky-100 text-sky-700',
  ];

  return (
    <div className="flex -space-x-2">
      {labels.slice(0, 4).map((member, index) => (
        <div
          key={member.id || member.user_id || index}
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-extrabold ${colors[index % colors.length]}`}
        >
          {String(member.username || member.user_id || 'U')
            .slice(0, 1)
            .toUpperCase()}
        </div>
      ))}
      {labels.length > 4 && (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-extrabold text-slate-500">
          +{labels.length - 4}
        </div>
      )}
    </div>
  );
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const {
    selectedGroup,
    members,
    isLoading,
    error,
    fetchGroupDetail,
    fetchGroupMembers,
    clearSelectedGroup,
  } = useGroupStore();

  useEffect(() => {
    fetchGroupDetail(groupId, testUserId);
    fetchGroupMembers(groupId, testUserId);

    return () => clearSelectedGroup();
  }, [groupId, fetchGroupDetail, fetchGroupMembers, clearSelectedGroup]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-slate-400">Loading group...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-[#EF4444]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/groups" className="text-sm font-extrabold text-[#4F46E5]">
            Back
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {selectedGroup?.name || 'Group'}
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            {selectedGroup?.description || 'No description yet.'}
          </p>
        </div>

        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4F46E5] text-2xl font-light leading-none text-white shadow-[0_12px_24px_rgba(79,70,229,0.25)]"
        >
          +
        </button>
      </header>

      <section className={`${cardClass} mb-5`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-400">Members</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {members.length || 1}
            </p>
          </div>
          <AvatarStack members={members} />
        </div>
      </section>

      <section
        className={`${cardClass} mb-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white`}
      >
        <p className="text-sm font-semibold text-slate-400">Group Balance</p>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#10B981]">
          You are owed $0.00
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-400">
          Expense splitting will appear here after manual expenses are added.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Expenses</h2>
          <button
            type="button"
            className="rounded-2xl bg-[#4F46E5] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
          >
            Add Expense
          </button>
        </div>

        <div className={`${cardClass} text-center`}>
          <p className="text-sm font-semibold text-slate-400">No expenses yet.</p>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            Next Milestone 1 step: add manual expense entry here.
          </p>
        </div>
      </section>
    </div>
  );
}
