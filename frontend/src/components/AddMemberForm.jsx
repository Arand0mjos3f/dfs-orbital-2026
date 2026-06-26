import { useEffect, useMemo, useState } from 'react';
import { addGroupMember } from '../api/groups';
import { getUsers } from '../api/users';

export default function AddMemberForm({
  groupId,
  ownerUserId,
  members,
  onMemberAdded,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    getUsers()
      .then((response) => {
        if (isActive) {
          setUsers(response.data);
        }
      })
      .catch(() => {
        if (isActive) {
          setError('Failed to load users');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingUsers(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.user_id));
    return users.filter((user) => !memberIds.has(user.id));
  }, [members, users]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedUserId) return;

    setIsAddingMember(true);
    setError('');

    try {
      await addGroupMember(
        groupId,
        {
          user_id: selectedUserId,
          role: 'member',
        },
        ownerUserId
      );

      setSelectedUserId('');
      await onMemberAdded();
    } catch (requestError) {
      setError(
        requestError.response?.data?.detail?.message ||
          'Failed to add member'
      );
    } finally {
      setIsAddingMember(false);
    }
  };

  if (isLoadingUsers) {
    return (
      <p className="mt-5 text-sm font-semibold text-slate-400">
        Loading available users...
      </p>
    );
  }

  if (availableUsers.length === 0) {
    return (
      <p className="mt-5 text-sm font-semibold text-slate-400">
        All registered users are already members.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 border-t border-slate-100 pt-5">
      <label
        htmlFor="member-user"
        className="mb-2 block text-sm font-bold text-slate-700"
      >
        Add member
      </label>

      <div className="flex gap-3">
        <select
          id="member-user"
          value={selectedUserId}
          onChange={(event) => {
            setSelectedUserId(event.target.value);
            setError('');
          }}
          className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
          required
        >
          <option value="">Choose a user</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username} ({user.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isAddingMember}
          className="rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
        >
          {isAddingMember ? 'Adding...' : 'Add'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm font-semibold text-[#EF4444]">
          {error}
        </p>
      )}
    </form>
  );
}