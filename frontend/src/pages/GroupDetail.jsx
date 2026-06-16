import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createGroupExpense, getGroupExpenses } from '../api/expenses';
import AddMemberForm from '../components/AddMemberForm';
import ExpenseReceiptItems from '../components/ExpenseReceiptItems';
import { useGroupStore } from '../store/groupStore';

const testUserId = '16ab9e31-56f1-4afc-8d2f-09f45dfd57da';

const cardClass =
  'rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

function AvatarStack({ members }) {
  const labels =
    members.length > 0
      ? members
      : [{ user_id: 'J' }, { user_id: 'A' }, { user_id: 'B' }];

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

function formatDate(value) {
  if (!value) return 'Unknown date';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
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

  const [expenses, setExpenses] = useState([]);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [expensesError, setExpensesError] = useState(null);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const sortedExpenses = useMemo(
    () =>
      [...expenses].sort(
        (first, second) =>
          new Date(second.created_at).getTime() -
          new Date(first.created_at).getTime()
      ),
    [expenses]
  );

  const refreshExpenses = useCallback(async () => {
    const response = await getGroupExpenses(groupId, testUserId);
    setExpenses(response.data.data);
  }, [groupId]);

  useEffect(() => {
    let isActive = true;

    fetchGroupDetail(groupId, testUserId);
    fetchGroupMembers(groupId, testUserId);

    getGroupExpenses(groupId, testUserId)
      .then((response) => {
        if (isActive) {
          setExpenses(response.data.data);
          setExpensesError(null);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching group expenses:', requestError);

        if (isActive) {
          setExpensesError('Failed to fetch expenses');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsExpensesLoading(false);
        }
      });

    return () => {
      isActive = false;
      clearSelectedGroup();
    };
  }, [groupId, fetchGroupDetail, fetchGroupMembers, clearSelectedGroup]);

  const handleCreateExpense = async (event) => {
    event.preventDefault();

    if (!expenseTitle.trim()) return;

    setIsSavingExpense(true);
    setExpensesError(null);

    try {
      await createGroupExpense(groupId, {
        title: expenseTitle.trim(),
        description: expenseDescription.trim() || null,
        created_by_id: testUserId,
      });

      setExpenseTitle('');
      setExpenseDescription('');
      setIsCreatingExpense(false);
      await refreshExpenses();
    } catch (requestError) {
      console.error('Error creating expense:', requestError);
      setExpensesError('Failed to create expense');
    } finally {
      setIsSavingExpense(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-slate-400">
            Loading group...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-[#EF4444]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
      <header className="mb-6 flex items-center justify-between gap-4">
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
          onClick={() => setIsCreatingExpense((value) => !value)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4F46E5] text-2xl font-light leading-none text-white shadow-[0_12px_24px_rgba(79,70,229,0.25)]"
        >
          +
        </button>
      </header>

      <section className={`${cardClass} mb-5`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-400">Members</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {members.length}
            </p>
          </div>

          <AvatarStack members={members} />
        </div>

        {members.length > 0 && (
          <div className="mt-5 space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {String(member.user_id).slice(0, 8)}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {member.role}
                  </p>
                </div>

                <p className="text-xs font-bold text-slate-400">Member</p>
              </div>
            ))}
          </div>
        )}

        <AddMemberForm
          groupId={groupId}
          ownerUserId={testUserId}
          members={members}
          onMemberAdded={() => fetchGroupMembers(groupId, testUserId)}
        />
      </section>

      <section
        className={`${cardClass} mb-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white`}
      >
        <p className="text-sm font-semibold text-slate-400">Group Balance</p>

        <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#10B981]">
          You are owed $0.00
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-400">
          Split results will appear here after item assignment is completed.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Expenses
          </h2>

          <button
            type="button"
            onClick={() => setIsCreatingExpense((value) => !value)}
            className="rounded-2xl bg-[#4F46E5] px-4 py-2 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
          >
            Add Expense
          </button>
        </div>

        {isCreatingExpense && (
          <form
            onSubmit={handleCreateExpense}
            className={`${cardClass} mb-5 space-y-3`}
          >
            <input
              type="text"
              value={expenseTitle}
              onChange={(event) => setExpenseTitle(event.target.value)}
              className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
              placeholder="Expense title"
              required
            />

            <textarea
              value={expenseDescription}
              onChange={(event) => setExpenseDescription(event.target.value)}
              className="min-h-24 w-full resize-none rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
              placeholder="Description"
            />

            <button
              type="submit"
              disabled={isSavingExpense}
              className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] disabled:bg-slate-300"
            >
              {isSavingExpense ? 'Creating...' : 'Create Expense'}
            </button>
          </form>
        )}

        {isExpensesLoading ? (
          <div className={`${cardClass} text-center`}>
            <p className="text-sm font-semibold text-slate-400">
              Loading expenses...
            </p>
          </div>
        ) : expensesError ? (
          <div className={`${cardClass} text-center`}>
            <p className="text-sm font-semibold text-[#EF4444]">
              {expensesError}
            </p>
          </div>
        ) : sortedExpenses.length === 0 ? (
          <div className={`${cardClass} text-center`}>
            <p className="text-sm font-semibold text-slate-400">
              No expenses yet.
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              Create a manual expense to start the Milestone 2 prototype flow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExpenses.map((expense) => (
              <article key={expense.id} className={cardClass}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                      {expense.title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-slate-400">
                      {expense.description || 'No description'}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-[#4F46E5]">
                    {expense.status}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>{formatDate(expense.created_at)}</span>
                  <span>{String(expense.id).slice(0, 8)}</span>
                </div>

                <ExpenseReceiptItems expense={expense} members={members} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}