import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useGroupStore = create((set) => ({
  // 1. Initial State
  groups: [],
  isLoading: false,
  error: null,

  // 2. Fetch Groups Worker
  fetchGroups: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // 💡 THE FIX: We specifically use ?user_id= here to match the GET endpoint
      const response = await apiClient.get(`/groups/?user_id=${userId}`);

      set({ groups: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching groups:', error);
      set({ error: 'Failed to fetch groups', isLoading: false });
    }
  },

  // 3. Create Group Worker
  createGroup: async (groupData, userId) => {
    try {
      // Note: We still use ?owner_id= here to match the POST endpoint!
      const response = await apiClient.post(`/groups/?owner_id=${userId}`, groupData);

      // Immediately add the new group to our local state so the UI updates instantly
      set((state) => ({
        groups: [...state.groups, response.data],
      }));
    } catch (error) {
      console.error('Error creating group:', error);
    }
  },
}));
