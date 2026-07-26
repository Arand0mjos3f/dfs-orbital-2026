import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupDebts } from '../api/debts';
import { getGroups } from '../api/groups';
import { getUsers } from '../api/users';
import { useAuthStore } from '../store/useAuthStore';

const cardClass =
  'rounded-[24px] border border-[#D8CAFF] bg-white p-5';

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatStatus(status) {
  const labels = {
    pending: 'Pending payment',
    marked_paid: 'Awaiting confirmation',
    confirmed_received: 'Settled',
  };

  return labels[status] || status;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = String(currentUser?.id || '');

  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [String(user.id), user])),
    [users]
  );

  const groupById = useMemo(
    () => Object.fromEntries(groups.map((group) => [String(group.id), group])),
    [groups]
  );

  const userDebts = useMemo(
    () =>
      debts.filter(
        (debt) =>
          String(debt.from_user_id) === currentUserId ||
          String(debt.to_user_id) === currentUserId
      ),
    [currentUserId, debts]
  );

  const outstandingDebts = useMemo(
    () =>
      userDebts.filter(
        (debt) =>
          debt.status !== 'cancelled' &&
          debt.status !== 'confirmed_received'
      ),
    [userDebts]
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

  const recentDebts = useMemo(
    () =>
      [...userDebts]
        .filter((debt) => debt.status !== 'cancelled')
        .sort(
          (first, second) =>
            new Date(second.created_at).getTime() -
            new Date(first.created_at).getTime()
        )
        .slice(0, 4),
    [userDebts]
  );

  useEffect(() => {
    let isActive = true;

    if (!currentUserId) {
      return () => {
        isActive = false;
      };
    }

    Promise.all([getGroups(currentUserId), getUsers()])
      .then(async ([groupsResponse, usersResponse]) => {
        const loadedGroups = groupsResponse.data.data;

        const debtResponses = await Promise.all(
          loadedGroups.map((group) =>
            getGroupDebts(group.id, currentUserId)
          )
        );

        if (isActive) {
          setGroups(loadedGroups);
          setUsers(usersResponse.data);
          setDebts(
            debtResponses.flatMap((response) => response.data.data)
          );
          setError('');
        }
      })
      .catch((requestError) => {
        console.error('Error loading dashboard:', requestError);

        if (isActive) {
          setError('Failed to load dashboard');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [currentUserId]);

  const getUserName = (userId) =>
    userById[String(userId)]?.username || String(userId).slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-slate-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
        <div className={cardClass}>
          <p className="text-center text-sm font-semibold text-[#B4233C]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
      <header className="mb-6">
        <p className="text-sm font-semibold text-slate-400">Welcome back</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
          {currentUser?.username || 'User'}
        </h1>
      </header>

      <section className="mb-6 rounded-[24px] border border-[#342A49] bg-[#241C35] p-6">
        <p className="text-sm font-semibold text-[#E8DFF5]">
          Total Balance
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-[#E8DFF5]">
              Owed to you
            </p>
            <p className="mt-2 text-3xl font-extrabold text-[#A7E8D5]">
              {formatCurrency(amountOwedToYou)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[#E8DFF5]">You owe</p>
            <p className="mt-2 text-3xl font-extrabold text-[#FFB8B2]">
              {formatCurrency(amountYouOwe)}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900">
            Pending Balances
          </h2>

          <button
            type="button"
            onClick={() => navigate('/debts')}
            className="text-sm font-extrabold text-[#6D4AEF]"
          >
            View all
          </button>
        </div>

        {outstandingDebts.length === 0 ? (
          <div className={cardClass}>
            <p className="text-center text-sm font-semibold text-slate-400">
              No pending balances.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {outstandingDebts.slice(0, 4).map((debt) => {
              const isPayer =
                String(debt.from_user_id) === currentUserId;
              const otherUserId = isPayer
                ? debt.to_user_id
                : debt.from_user_id;

              return (
                <div key={debt.id} className={cardClass}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p
                        className={`font-extrabold ${
                          isPayer
                            ? 'text-[#B96870]'
                            : 'text-[#3F8F79]'
                        }`}
                      >
                        {isPayer
                          ? `You owe ${getUserName(otherUserId)}`
                          : `${getUserName(otherUserId)} owes you`}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-400">
                        {groupById[String(debt.group_id)]?.name ||
                          'Group settlement'}
                      </p>
                    </div>

                    <p className="shrink-0 text-lg font-extrabold text-slate-900">
                      {formatCurrency(debt.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-extrabold text-slate-900">
          Recent Activity
        </h2>

        <div className={cardClass}>
          {recentDebts.length === 0 ? (
            <p className="text-center text-sm font-semibold text-slate-400">
              No settlement activity yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentDebts.map((debt) => (
                <div
                  key={debt.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900">
                      {getUserName(debt.from_user_id)} pays{' '}
                      {getUserName(debt.to_user_id)}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-400">
                      {groupById[String(debt.group_id)]?.name ||
                        'Group settlement'}{' '}
                      · {formatStatus(debt.status)}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-extrabold text-slate-900">
                    {formatCurrency(debt.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
