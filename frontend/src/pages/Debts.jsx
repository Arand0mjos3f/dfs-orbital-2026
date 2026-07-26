import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  confirmDebtReceived,
  getGroupDebts,
  markDebtPaid,
} from '../api/debts';
import { getGroups } from '../api/groups';
import { getUsers } from '../api/users';
import { useAuthStore } from '../store/useAuthStore';

const cardClass =
  'rounded-[24px] border border-[#D8CAFF] bg-white p-5';

const selectedGroupStorageKey = 'dfs-selected-debt-group';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatStatus(status) {
  const labels = {
    pending: 'Pending payment',
    marked_paid: 'Awaiting confirmation',
    confirmed_received: 'Settled',
    cancelled: 'Cancelled',
  };

  return labels[status] || status;
}

function getStatusClass(status) {
  if (status === 'confirmed_received') {
    return 'bg-emerald-50 text-emerald-600';
  }

  if (status === 'marked_paid') {
    return 'bg-amber-50 text-amber-600';
  }

  if (status === 'cancelled') {
    return 'bg-slate-100 text-slate-400';
  }

  return 'bg-indigo-50 text-[#6D4AEF]';
}

export default function Debts() {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = String(currentUser?.id || '');

  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [debts, setDebts] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingDebts, setIsLoadingDebts] = useState(false);
  const [actionDebtId, setActionDebtId] = useState('');
  const [pageError, setPageError] = useState('');
  const [debtError, setDebtError] = useState('');

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const activeDebts = useMemo(
    () => debts.filter((debt) => debt.status !== 'cancelled'),
    [debts]
  );

  const outstandingDebts = useMemo(
    () =>
      activeDebts.filter((debt) => debt.status !== 'confirmed_received'),
    [activeDebts]
  );

  const amountYouOwe = useMemo(
    () =>
      outstandingDebts
        .filter((debt) => String(debt.from_user_id) === currentUserId)
        .reduce((total, debt) => total + Number(debt.amount || 0), 0),
    [currentUserId, outstandingDebts]
  );

  const amountOwedToYou = useMemo(
    () =>
      outstandingDebts
        .filter((debt) => String(debt.to_user_id) === currentUserId)
        .reduce((total, debt) => total + Number(debt.amount || 0), 0),
    [currentUserId, outstandingDebts]
  );

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const authError = !currentUserId
    ? 'Please sign in again to view settlements.'
    : '';

  useEffect(() => {
    let isActive = true;

    if (!currentUserId) {
      return () => {
        isActive = false;
      };
    }

    Promise.allSettled([getGroups(currentUserId), getUsers()])
      .then(([groupsResult, usersResult]) => {
        if (!isActive) return;

        if (groupsResult.status === 'rejected') {
          throw groupsResult.reason;
        }

        const loadedGroups = groupsResult.value.data.data;

        setGroups(loadedGroups);
        setUsers(
          usersResult.status === 'fulfilled' ? usersResult.value.data : []
        );
        setDebtError('');
        setPageError(
          usersResult.status === 'rejected'
            ? 'Groups loaded, but member names could not be loaded.'
            : ''
        );

        if (loadedGroups.length > 0) {
          const storedGroupId = window.localStorage.getItem(
            selectedGroupStorageKey
          );

          const initialGroupId = loadedGroups.some(
            (group) => group.id === storedGroupId
          )
            ? storedGroupId
            : loadedGroups[0].id;

          window.localStorage.setItem(
            selectedGroupStorageKey,
            initialGroupId
          );
          setIsLoadingDebts(true);
          setSelectedGroupId(initialGroupId);
        } else {
          setDebts([]);
          setSelectedGroupId('');
        }
      })
      .catch((requestError) => {
        console.error('Error loading debts page:', requestError);

        if (isActive) {
          setGroups([]);
          setDebts([]);
          setSelectedGroupId('');
          setPageError(
            requestError.response?.data?.detail?.message ||
              'Failed to load your groups. Try refreshing the page.'
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingPage(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    let isActive = true;

    if (!selectedGroupId || !currentUserId) {
      return () => {
        isActive = false;
      };
    }

    getGroupDebts(selectedGroupId, currentUserId)
      .then((response) => {
        if (isActive) {
          setDebts(response.data.data);
          setDebtError('');
        }
      })
      .catch((requestError) => {
        console.error('Error loading group debts:', requestError);

        if (isActive) {
          setDebts([]);
          setDebtError(
            requestError.response?.data?.detail?.message ||
              'Failed to load group debts'
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingDebts(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUserId, selectedGroupId]);

  const getUserName = (userId) =>
    userById[String(userId)]?.username || String(userId).slice(0, 8);

  const refreshDebts = async () => {
    const response = await getGroupDebts(selectedGroupId, currentUserId);
    setDebts(response.data.data);
  };

  const handleGroupChange = (event) => {
    const groupId = event.target.value;

    window.localStorage.setItem(selectedGroupStorageKey, groupId);
    setDebts([]);
    setDebtError('');
    setIsLoadingDebts(true);
    setSelectedGroupId(groupId);
  };

  const handleMarkPaid = async (debtId) => {
    setActionDebtId(debtId);
    setDebtError('');

    try {
      await markDebtPaid(debtId, currentUserId, {
        payment_proof_url: null,
      });
      await refreshDebts();
    } catch (requestError) {
      console.error('Error marking debt paid:', requestError);
      setDebtError(
        requestError.response?.data?.detail?.message ||
          'Failed to mark debt as paid'
      );
    } finally {
      setActionDebtId('');
    }
  };

  const handleConfirmReceived = async (debtId) => {
    setActionDebtId(debtId);
    setDebtError('');

    try {
      await confirmDebtReceived(debtId, currentUserId);
      await refreshDebts();
    } catch (requestError) {
      console.error('Error confirming payment:', requestError);
      setDebtError(
        requestError.response?.data?.detail?.message ||
          'Failed to confirm payment'
      );
    } finally {
      setActionDebtId('');
    }
  };

  if (authError) {
    return (
      <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-[#B4233C]">
            {authError}
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingPage) {
    return (
      <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-slate-400">
            Loading settlements...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
      <header className="mb-6">
        <p className="text-sm font-semibold text-slate-400">
          {currentUser?.username || 'Current user'}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
          Debts
        </h1>
      </header>

      {pageError ? (
        <section className={cardClass}>
          <p className="text-center text-sm font-semibold text-[#B4233C]">
            {pageError}
          </p>
        </section>
      ) : groups.length === 0 ? (
        <section className={`${cardClass} text-center`}>
          <p className="text-sm font-semibold text-slate-400">
            No groups found for this account.
          </p>

          <Link
            to="/groups?create=1"
            className="mt-4 inline-flex rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white"
          >
            Create Group
          </Link>
        </section>
      ) : (
        <>
          <section className={`${cardClass} mb-5`}>
            <label
              htmlFor="debt-group"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Group
            </label>

            <select
              id="debt-group"
              value={selectedGroupId}
              onChange={handleGroupChange}
              className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </section>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-[24px] border border-[#FFD3CE] bg-[#FFE6E3] p-5">
              <p className="text-xs font-bold text-[#C24952]">You owe</p>
              <p className="mt-2 text-2xl font-extrabold text-[#C24952]">
                {formatCurrency(amountYouOwe)}
              </p>
            </div>

            <div className="rounded-[24px] border border-[#D8CAFF] bg-white p-5">
              <p className="text-xs font-bold text-slate-400">Owed to you</p>
              <p className="mt-2 text-2xl font-extrabold text-[#167A61]">
                {formatCurrency(amountOwedToYou)}
              </p>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  {selectedGroup?.name || 'Group'}
                </p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                  Settlements
                </h2>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-[#6D4AEF]">
                {activeDebts.length}
              </span>
            </div>

            {isLoadingDebts ? (
              <p className="text-center text-sm font-semibold text-slate-400">
                Loading group debts...
              </p>
            ) : activeDebts.length === 0 ? (
              <p className="rounded-2xl bg-[#FFF9F4] px-4 py-4 text-center text-sm font-semibold text-slate-400">
                No calculated settlements for this group.
              </p>
            ) : (
              <div className="space-y-3">
                {activeDebts.map((debt) => {
                  const fromUserId = String(debt.from_user_id);
                  const toUserId = String(debt.to_user_id);
                  const canMarkPaid =
                    debt.status === 'pending' &&
                    fromUserId === currentUserId;
                  const canConfirm =
                    debt.status === 'marked_paid' &&
                    toUserId === currentUserId;
                  const isActionLoading = actionDebtId === debt.id;

                  return (
                    <div
                      key={debt.id}
                      className="rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold text-slate-900">
                            {getUserName(fromUserId)} pays{' '}
                            {getUserName(toUserId)}
                          </p>

                          <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${getStatusClass(debt.status)}`}
                          >
                            {formatStatus(debt.status)}
                          </span>
                        </div>

                        <p className="shrink-0 text-lg font-extrabold text-slate-900">
                          {formatCurrency(debt.amount)}
                        </p>
                      </div>

                      {canMarkPaid && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(debt.id)}
                          disabled={isActionLoading}
                          className="mt-4 w-full rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                        >
                          {isActionLoading ? 'Updating...' : 'Mark paid'}
                        </button>
                      )}

                      {canConfirm && (
                        <button
                          type="button"
                          onClick={() => handleConfirmReceived(debt.id)}
                          disabled={isActionLoading}
                          className="mt-4 w-full rounded-2xl bg-[#167A61] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                        >
                          {isActionLoading
                            ? 'Updating...'
                            : 'Confirm received'}
                        </button>
                      )}

                      {!canMarkPaid &&
                        !canConfirm &&
                        debt.status === 'pending' && (
                          <p className="mt-4 text-xs font-semibold text-slate-400">
                            Waiting for {getUserName(fromUserId)} to mark this
                            payment as paid.
                          </p>
                        )}

                      {!canMarkPaid &&
                        !canConfirm &&
                        debt.status === 'marked_paid' && (
                          <p className="mt-4 text-xs font-semibold text-slate-400">
                            Waiting for {getUserName(toUserId)} to confirm the
                            payment.
                          </p>
                        )}
                    </div>
                  );
                })}
              </div>
            )}

            {debtError && (
              <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-[#B4233C]">
                {debtError}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
