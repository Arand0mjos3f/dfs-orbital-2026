import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { calculateExpenseDebts, getGroupDebts } from '../api/debts';
import { createGroupExpense, getGroupExpenses } from '../api/expenses';
import { getUsers } from '../api/users';
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

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return 'Unknown date';

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatUser(userId, userById) {
  return userById[String(userId)]?.username || String(userId).slice(0, 8);
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
  const [debts, setDebts] = useState([]);
  const [users, setUsers] = useState([]);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [isDebtsLoading, setIsDebtsLoading] = useState(true);
  const [expensesError, setExpensesError] = useState(null);
  const [debtsError, setDebtsError] = useState(null);
  const [isCreatingExpense, setIsCreatingExpense] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [calculatingExpenseId, setCalculatingExpenseId] = useState('');

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const enrichedMembers = useMemo(
    () =>
      members.map((member) => ({
        ...member,
        username: userById[String(member.user_id)]?.username,
        email: userById[String(member.user_id)]?.email,
      })),
    [members, userById]
  );

  const pendingDebts = useMemo(
    () => debts.filter((debt) => debt.status !== 'cancelled'),
    [debts]
  );

  const totalPendingDebt = useMemo(
    () =>
      pendingDebts.reduce(
        (total, debt) => total + Number(debt.amount || 0),
        0
      ),
    [pendingDebts]
  );

  const debtByExpenseId = useMemo(() => {
    const result = {};

    debts.forEach((debt) => {
      if (!debt.expense_id) return;

      result[debt.expense_id] = [...(result[debt.expense_id] || []), debt];
    });

    return result;
  }, [debts]);

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

  const refreshDebts = useCallback(async () => {
    const response = await getGroupDebts(groupId, testUserId);
    setDebts(response.data.data);
  }, [groupId]);

  useEffect(() => {
    let isActive = true;

    fetchGroupDetail(groupId, testUserId);
    fetchGroupMembers(groupId, testUserId);

    getUsers()
      .then((response) => {
        if (isActive) {
          setUsers(response.data);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching users:', requestError);
      });

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

    getGroupDebts(groupId, testUserId)
      .then((response) => {
        if (isActive) {
          setDebts(response.data.data);
          setDebtsError(null);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching group debts:', requestError);

        if (isActive) {
          setDebtsError('Failed to fetch settlement summary');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsDebtsLoading(false);
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

  const handleCalculateDebts = async (expenseId) => {
    setCalculatingExpenseId(expenseId);
    setDebtsError(null);

    try {
      await calculateExpenseDebts(expenseId);
      await refreshDebts();
    } catch (requestError) {
      console.error('Error calculating debts:', requestError);
      setDebtsError(
        requestError.response?.data?.detail?.message ||
          'Failed to calculate settlement'
      );
    } finally {
      setCalculatingExpenseId('');
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
              {enrichedMembers.length}
            </p>
          </div>

          <AvatarStack members={enrichedMembers} />
        </div>

        {enrichedMembers.length > 0 && (
          <div className="mt-5 space-y-3">
            {enrichedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    {member.username || String(member.user_id).slice(0, 8)}
                  </p>
                  <p className="text-xs font-semibold text-slate-400">
                    {member.email || member.role}
                  </p>
                </div>

                <p className="text-xs font-bold text-slate-400">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        )}

        <AddMemberForm
          groupId={groupId}
          ownerUserId={testUserId}
          members={enrichedMembers}
          onMemberAdded={() => fetchGroupMembers(groupId, testUserId)}
        />
      </section>

      <section
        className={`${cardClass} mb-5 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              Settlement Summary
            </p>

            <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#10B981]">
              {formatCurrency(totalPendingDebt)}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              {pendingDebts.length === 0
                ? 'No settlement has been calculated yet.'
                : `${pendingDebts.length} settlement transaction${pendingDebts.length === 1 ? '' : 's'} pending.`}
            </p>
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white">
            DFS
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {isDebtsLoading ? (
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-300">
              Loading settlement summary...
            </p>
          ) : pendingDebts.length === 0 ? (
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-300">
              Assign items and calculate settlement for an expense to see who
              should pay whom.
            </p>
          ) : (
            pendingDebts.map((debt) => (
              <div
                key={debt.id}
                className="rounded-2xl bg-white px-4 py-3 text-slate-900"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold">
                    {formatUser(debt.from_user_id, userById)} pays{' '}
                    {formatUser(debt.to_user_id, userById)}
                  </p>

                  <p className="text-sm font-extrabold text-[#10B981]">
                    {formatCurrency(debt.amount)}
                  </p>
                </div>

                <p className="mt-1 text-xs font-semibold text-slate-400">
                  {debt.status}
                </p>
              </div>
            ))
          )}
        </div>

        {debtsError && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444]">
            {debtsError}
          </p>
        )}
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
            {sortedExpenses.map((expense) => {
              const expenseDebts = debtByExpenseId[expense.id] || [];
              const hasCalculatedDebts = expenseDebts.some(
                (debt) => debt.status !== 'cancelled'
              );

              return (
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

                  <ExpenseReceiptItems
                    expense={expense}
                    members={enrichedMembers}
                  />

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() => handleCalculateDebts(expense.id)}
                      disabled={
                        hasCalculatedDebts ||
                        calculatingExpenseId === expense.id
                      }
                      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                    >
                      {hasCalculatedDebts
                        ? 'Settlement calculated'
                        : calculatingExpenseId === expense.id
                          ? 'Calculating settlement...'
                          : 'Calculate settlement'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}