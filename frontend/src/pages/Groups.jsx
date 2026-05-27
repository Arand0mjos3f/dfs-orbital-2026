import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroupStore } from '../store/groupStore';

const testUserId = '16ab9e31-56f1-4afc-8d2f-09f45dfd57da';

const cardClass = 'rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]';

export default function Groups() {
  const navigate = useNavigate();
  const { groups, isLoading, error, fetchGroups, createGroup, updateGroup, deleteGroup } =
    useGroupStore();

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingGroupId, setSavingGroupId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchGroups(testUserId);
  }, [fetchGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!newGroupName.trim()) return;

    await createGroup(
      {
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
      },
      testUserId
    );

    setNewGroupName('');
    setNewGroupDesc('');
    setIsCreating(false);
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
    if (!editName.trim()) return;

    setSavingGroupId(groupId);

    try {
      await updateGroup(
        groupId,
        {
          name: editName.trim(),
          description: editDesc.trim(),
        },
        testUserId
      );

      cancelEditing();
    } finally {
      setSavingGroupId(null);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const confirmed = window.confirm('Delete this group? This action cannot be undone.');

    if (!confirmed) return;

    await deleteGroup(groupId, testUserId);
  };

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-5 pb-8 pt-5">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Groups</h1>
        <button
          type="button"
          onClick={() => setIsCreating((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4F46E5] text-2xl font-light leading-none text-white shadow-[0_12px_24px_rgba(79,70,229,0.25)]"
        >
          +
        </button>
      </header>

      {isCreating && (
        <form onSubmit={handleCreateGroup} className={`${cardClass} mb-5 space-y-3`}>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
            placeholder="Group name"
            required
          />

          <input
            type="text"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
            className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
            placeholder="Description"
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
          >
            Create Group
          </button>
        </form>
      )}

      {isLoading ? (
        <div className={`${cardClass} text-center text-sm font-semibold text-slate-400`}>
          Loading your groups...
        </div>
      ) : error ? (
        <div className={`${cardClass} text-center text-sm font-semibold text-[#EF4444]`}>
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div className={`${cardClass} text-center text-sm font-semibold text-slate-400`}>
          No groups found. Create your first one.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const isEditing = editingGroupId === group.id;
            const isSaving = savingGroupId === group.id;

            return (
              <div
                key={group.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/groups/${group.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/groups/${group.id}`);
                }}
                className={`${cardClass} cursor-pointer transition active:scale-[0.99]`}
              >
                {isEditing ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                      required
                    />

                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="min-h-24 w-full resize-none rounded-2xl border border-slate-100 bg-[#F8FAFC] px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-[#4F46E5]"
                      placeholder="Description"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateGroup(group.id)}
                        disabled={isSaving}
                        className="rounded-2xl bg-[#4F46E5] px-4 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)] disabled:bg-slate-300"
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
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        {group.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-400">
                        {group.description || 'No description yet.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/groups/${group.id}`);
                        }}
                        className="rounded-2xl bg-[#4F46E5] px-4 py-2.5 text-xs font-extrabold text-white shadow-[0_8px_20px_rgba(79,70,229,0.25)]"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(group);
                        }}
                        className="rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-extrabold text-slate-500"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                        className="rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-extrabold text-[#EF4444]"
                      >
                        Delete
                      </button>
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
