import { useEffect, useState } from 'react';
import { useGroupStore } from '../store/groupStore';

export default function Groups() {
  const { groups, isLoading, error, fetchGroups, createGroup } = useGroupStore();

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Hardcoded test user ID (will link this to useAuthStore later!)
  const testUserId = '16ab9e31-56f1-4afc-8d2f-09f45dfd57da';

  useEffect(() => {
    fetchGroups(testUserId);
  }, [fetchGroups]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName) return;

    await createGroup({ name: newGroupName, description: newGroupDesc }, testUserId);

    setNewGroupName('');
    setNewGroupDesc('');
  };

  if (isLoading) return <div className="p-4 text-center">Loading your groups...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Groups</h1>

      <form
        onSubmit={handleCreateGroup}
        className="bg-white p-4 rounded-lg shadow-md border mb-8 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="e.g., Weekend Getaway"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={newGroupDesc}
            onChange={(e) => setNewGroupDesc(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="What is this group for?"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full font-medium"
        >
          Create Group
        </button>
      </form>

      {groups.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No groups found. Create your first one above!
        </p>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li
              key={group.id}
              className="border p-4 rounded-lg shadow-sm bg-gray-50 hover:bg-white transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
              <p className="text-gray-600 mt-1">{group.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
