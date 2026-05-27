import { create } from 'zustand';
import {
  createGroup as createGroupRequest,
  deleteGroup as deleteGroupRequest,
  getGroupDetail as getGroupDetailRequest,
  getGroupMembers as getGroupMembersRequest,
  getGroups as getGroupsRequest,
  updateGroup as updateGroupRequest,
} from '../api/groups';

export const useGroupStore = create((set) => ({
  groups: [],
  selectedGroup: null,
  members: [],
  isLoading: false,
  error: null,

  fetchGroups: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getGroupsRequest(userId);

      set({ groups: response.data.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching groups:', error);
      set({ error: 'Failed to fetch groups', isLoading: false });
    }
  },

  fetchGroupDetail: async (groupId, userId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await getGroupDetailRequest(groupId, userId);

      set({ selectedGroup: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching group detail:', error);
      set({ error: 'Failed to fetch group detail', isLoading: false });
      throw error;
    }
  },

  fetchGroupMembers: async (groupId, userId) => {
    try {
      const response = await getGroupMembersRequest(groupId, userId);

      set({ members: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      set({ error: 'Failed to fetch group members' });
      throw error;
    }
  },

  createGroup: async (groupData, userId) => {
    try {
      const response = await createGroupRequest({
        ...groupData,
        created_by_id: userId,
      });

      set((state) => ({
        groups: [...state.groups, response.data.data],
      }));

      return response.data.data;
    } catch (error) {
      console.error('Error creating group:', error);
      set({ error: 'Failed to create group' });
      throw error;
    }
  },

  updateGroup: async (groupId, groupData, userId) => {
    try {
      const response = await updateGroupRequest(groupId, groupData, userId);

      set((state) => ({
        groups: state.groups.map((group) => (group.id === groupId ? response.data.data : group)),
        selectedGroup:
          state.selectedGroup?.id === groupId ? response.data.data : state.selectedGroup,
      }));

      return response.data.data;
    } catch (error) {
      console.error('Error updating group:', error);
      set({ error: 'Failed to update group' });
      throw error;
    }
  },

  deleteGroup: async (groupId, userId) => {
    try {
      await deleteGroupRequest(groupId, userId);

      set((state) => ({
        groups: state.groups.filter((group) => group.id !== groupId),
        selectedGroup: state.selectedGroup?.id === groupId ? null : state.selectedGroup,
      }));
    } catch (error) {
      console.error('Error deleting group:', error);
      set({ error: 'Failed to delete group' });
      throw error;
    }
  },

  clearSelectedGroup: () => {
    set({ selectedGroup: null, members: [], error: null });
  },
}));
