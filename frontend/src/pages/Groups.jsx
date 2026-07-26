import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useGroupStore } from '../store/groupStore';

const cardClass =
  'rounded-[24px] border border-[#D8CAFF] bg-white p-5';

export default function Groups() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = currentUser?.id;

  const {
    groups,
    isLoading,
    error,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
  } = useGroupStore();

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingGroupId, setSavingGroupId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const isCreateQueryActive = searchParams.get('create') === '1';
  const showCreateForm = isCreating || isCreateQueryActive;

  useEffect(() => {
    if (currentUserId) {
      fetchGroups(currentUserId);
    }
  }, [currentUserId, fetchGroups]);

  const handleToggleCreate = () => {
    if (showCreateForm) {
      setIsCreating(false);

      if (isCreateQueryActive) {
        navigate('/groups', { replace: true });
      }

      return;
    }

    setIsCreating(true);
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();

    if (!newGroupName.trim() || !currentUserId) return;

    const createdGroup = await createGroup(
      {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
      },
      currentUserId
    );

    setNewGroupName('');
    setNewGroupDesc('');
    setIsCreating(false);
    navigate(`/groups/${createdGroup.id}`);
  };

  const startEditing = (group) => {
    setEditingGroupId(group.id);
    setEditName(group.name);
    setEditDesc(group.description || '');
  };

  const cancelEditing = () => {
    setEditingGroupId(null);
    setEditName('');
    setEditDesc('');
  };

  const handleUpdateGroup = async (groupId) => {
    if (!editName.trim() || !currentUserId) return;

    setSavingGroupId(groupId);

    try {
      await updateGroup(
        groupId,
        {
          name: editName.trim(),
          description: editDesc.trim(),
        },
        currentUserId
      );

      cancelEditing();
    } finally {
      setSavingGroupId(null);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!currentUserId) return;

    const confirmed = window.confirm(
      'Delete this group? This action cannot be undone.'
    );

    if (!confirmed) return;

    await deleteGroup(groupId, currentUserId);
  };

  return (
    <div className="min-h-dvh bg-[#FFF9F4] px-5 pb-8 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">
          My Groups
        </h1>

        <button
          type="button"
          onClick={handleToggleCreate}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] text-2xl font-light leading-none text-white"
        >
          +
        </button>
      </header>

      {showCreateForm && (
        <form
          onSubmit={handleCreateGroup}
          className={`${cardClass} mb-5 space-y-3`}
        >
          <input
            type="text"
            value={newGroupName}
            onChange={(event) => setNewGroupName(event.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
            placeholder="Group name"
            required
          />

          <input
            type="text"
            value={newGroupDesc}
            onChange={(event) => setNewGroupDesc(event.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
            placeholder="Description"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white"
          >
            Create Group
          </button>
        </form>
      )}

      {isLoading ? (
        <div
          className={`${cardClass} text-center text-sm font-semibold text-slate-400`}
        >
          Loading your groups...
        </div>
      ) : error ? (
        <div
          className={`${cardClass} text-center text-sm font-semibold text-[#B4233C]`}
        >
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div
          className={`${cardClass} text-center text-sm font-semibold text-slate-400`}
        >
          No groups found. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isEditing = editingGroupId === group.id;
            const isSaving = savingGroupId === group.id;
            const isOwner =
              String(group.created_by_id) === String(currentUserId);

            return (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/groups/${group.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    navigate(`/groups/${group.id}`);
                  }
                }}
                className={`${cardClass} cursor-pointer transition active:scale-[0.99]`}
              >
                {isEditing ? (
                  <div
                    className="space-y-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                      required
                    />

                    <textarea
                      value={editDesc}
                      onChange={(event) => setEditDesc(event.target.value)}
                      className="min-h-24 w-full resize-none rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#6D4AEF]"
                      placeholder="Description"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateGroup(group.id)}
                        disabled={isSaving}
                        className="rounded-2xl bg-[#6D4AEF] hover:bg-[#5938D6] px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-extrabold text-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-5">
                      <h2 className="text-xl font-extrabold text-slate-900">
                        {group.name}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-400">
                        {group.description || 'No description yet.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/groups/${group.id}`);
                        }}
                        className="rounded-2xl bg-[#F1EBFF] px-4 py-2.5 text-xs font-extrabold text-[#5938D6] hover:bg-[#E8DEFF]"
                      >
                        Open
                      </button>

                      {isOwner && (
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              startEditing(group);
                            }}
                            className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-500"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteGroup(group.id);
                            }}
                            className="rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-extrabold text-[#B4233C]"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
