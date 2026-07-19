import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  getGroupDebtSummary,
  getGroupDebts,
  recalculateExpenseDebts,
} from '../api/debts';
import { createGroupExpense, getGroupExpenses } from '../api/expenses';
import { getUsers } from '../api/users';
import AddMemberForm from '../components/AddMemberForm';
import ExpenseReceiptItems from '../components/ExpenseReceiptItems';
import { useAuthStore } from '../store/useAuthStore';
import { useGroupStore } from '../store/groupStore';

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

function getBalanceBadge(summary) {
  const netAmount = Number(summary.net_amount || 0);

  if (netAmount > 0) {
    return {
      label: `Owed ${formatCurrency(netAmount)}`,
      className: 'bg-emerald-50 text-emerald-600',
    };
  }

  if (netAmount < 0) {
    return {
      label: `Owes ${formatCurrency(Math.abs(netAmount))}`,
      className: 'bg-rose-50 text-rose-600',
    };
  }

  return {
    label: 'Settled',
    className: 'bg-slate-100 text-slate-500',
  };
}

export default function GroupDetail() {
  const { groupId } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;

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
  const [debtSummary, setDebtSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [isDebtsLoading, setIsDebtsLoading] = useState(true);
  const [isDebtSummaryLoading, setIsDebtSummaryLoading] = useState(true);
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
    () =>
      debts.filter(
        (debt) =>
          debt.status !== 'cancelled' &&
          debt.status !== 'confirmed_received'
      ),
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

  const summaryOutstandingAmount = debtSummary
    ? Number(debtSummary.outstanding_amount || 0)
    : totalPendingDebt;
  const summaryOutstandingCount = debtSummary
    ? Number(debtSummary.outstanding_debt_count || 0)
    : pendingDebts.length;
  const summarySettledCount = debtSummary
    ? Number(debtSummary.settled_debt_count || 0)
    : debts.filter((debt) => debt.status === 'confirmed_received').length;
  const memberSummaries = debtSummary?.member_summaries || [];
  const isSettlementLoading = isDebtsLoading || isDebtSummaryLoading;

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
    if (!currentUserId) return;

    const response = await getGroupExpenses(groupId, currentUserId);
    setExpenses(response.data.data);
  }, [currentUserId, groupId]);

  const refreshDebts = useCallback(async () => {
    if (!currentUserId) return;

    const response = await getGroupDebts(groupId, currentUserId);
    setDebts(response.data.data);
  }, [currentUserId, groupId]);

  const refreshDebtSummary = useCallback(async () => {
    if (!currentUserId) return;

    const response = await getGroupDebtSummary(groupId, currentUserId);
    setDebtSummary(response.data.data);
  }, [currentUserId, groupId]);

  useEffect(() => {
    let isActive = true;

    if (!currentUserId) {
      return () => {
        isActive = false;
      };
    }

    fetchGroupDetail(groupId, currentUserId);
    fetchGroupMembers(groupId, currentUserId);

    getUsers()
      .then((response) => {
        if (isActive) {
          setUsers(response.data);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching users:', requestError);
      });

    getGroupExpenses(groupId, currentUserId)
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

    getGroupDebts(groupId, currentUserId)
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

    getGroupDebtSummary(groupId, currentUserId)
      .then((response) => {
        if (isActive) {
          setDebtSummary(response.data.data);
          setDebtsError(null);
        }
      })
      .catch((requestError) => {
        console.error('Error fetching group debt summary:', requestError);

        if (isActive) {
          setDebtsError('Failed to fetch settlement summary');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsDebtSummaryLoading(false);
        }
      });

    return () => {
      isActive = false;
      clearSelectedGroup();
    };
  }, [
    currentUserId,
    groupId,
    fetchGroupDetail,
    fetchGroupMembers,
    clearSelectedGroup,
  ]);

  const handleCreateExpense = async (event) => {
    event.preventDefault();

    if (!expenseTitle.trim() || !currentUserId) return;

    setIsSavingExpense(true);
    setExpensesError(null);

    try {
      await createGroupExpense(groupId, {
        title: expenseTitle.trim(),
        description: expenseDescription.trim() || null,
        created_by_id: currentUserId,
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
      await recalculateExpenseDebts(expenseId);
      await Promise.all([refreshDebts(), refreshDebtSummary()]);
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

          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            {selectedGroup?.name || 'Group'}
          </h1>

          <p className="mt-2 text-sm font-semibold text-slate-400">
            {selectedGroup?.description || 'No description yet.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingExpense((value) => !value)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4F46E5] text-2xl font-light leading-none text-white"
        >
          +
        </button>
      </header>

      <section className={`${cardClass} mb-5`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-400">Members</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
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

        {String(selectedGroup?.created_by_id) === String(currentUserId) && (
          <AddMemberForm
            groupId={groupId}
            ownerUserId={currentUserId}
            members={enrichedMembers}
            onMemberAdded={() => fetchGroupMembers(groupId, currentUserId)}
          />
        )}
      </section>

      <section className={`${cardClass} mb-5 bg-slate-900 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">
              Settlement Summary
            </p>

            <p className="mt-3 text-3xl font-extrabold text-[#10B981]">
              {formatCurrency(summaryOutstandingAmount)}
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-400">
              {summaryOutstandingCount === 0
                ? 'No outstanding settlement transactions.'
                : `${summaryOutstandingCount} settlement transaction${summaryOutstandingCount === 1 ? '' : 's'} outstanding.`}
            </p>
          </div>

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-white">
            DFS
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-bold text-slate-400">Outstanding</p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {summaryOutstandingCount}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-bold text-slate-400">Settled</p>
            <p className="mt-1 text-lg font-extrabold text-white">
              {summarySettledCount}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {isSettlementLoading ? (
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-300">
              Loading settlement summary...
            </p>
          ) : pendingDebts.length === 0 ? (
            <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-slate-300">
              Assigned and settled transactions will appear in the Debts tab.
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

        {memberSummaries.length > 0 && (
          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="text-sm font-extrabold text-white">
              Member Balances
            </p>

            <div className="mt-3 space-y-3">
              {memberSummaries.map((summary) => {
                const badge = getBalanceBadge(summary);

                return (
                  <div
                    key={summary.user_id}
                    className="rounded-2xl bg-white px-4 py-3 text-slate-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold">
                        {formatUser(summary.user_id, userById)}
                      </p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Owes {formatCurrency(summary.owes_amount)} | Owed{' '}
                      {formatCurrency(summary.owed_amount)} |{' '}
                      {summary.outstanding_transaction_count} active
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {debtsError && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#EF4444]">
            {debtsError}
          </p>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900">Expenses</h2>

          <button
            type="button"
            onClick={() => setIsCreatingExpense((value) => !value)}
            className="rounded-2xl bg-[#4F46E5] px-4 py-2 text-xs font-extrabold text-white"
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
              className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
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
                      <h3 className="text-lg font-extrabold text-slate-900">
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