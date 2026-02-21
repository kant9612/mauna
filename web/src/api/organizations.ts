import apiClient from './client';
import type { Department, Group, Engineer, GroupMemberAssignmentResponse } from '../types';

export const departmentsApi = {
  getAll: async (includeGroups = false): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>('/departments', {
      params: { includeGroups },
    });
    return response.data;
  },

  getById: async (id: number, includeGroups = false): Promise<Department> => {
    const response = await apiClient.get<Department>(`/departments/${id}`, {
      params: { includeGroups },
    });
    return response.data;
  },

  create: async (department: Omit<Department, 'id' | 'groups'>): Promise<Department> => {
    const response = await apiClient.post<Department>('/departments', department);
    return response.data;
  },

  update: async (id: number, department: Omit<Department, 'id' | 'groups'>): Promise<Department> => {
    const response = await apiClient.put<Department>(`/departments/${id}`, department);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/departments/${id}`);
  },
};

export const groupsApi = {
  getAll: async (departmentId?: number): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>('/groups', {
      params: departmentId ? { departmentId } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<Group> => {
    const response = await apiClient.get<Group>(`/groups/${id}`);
    return response.data;
  },

  create: async (group: Omit<Group, 'id' | 'departmentName' | 'leaderName'>): Promise<Group> => {
    const response = await apiClient.post<Group>('/groups', group);
    return response.data;
  },

  update: async (id: number, group: Omit<Group, 'id' | 'departmentName' | 'leaderName'>): Promise<Group> => {
    const response = await apiClient.put<Group>(`/groups/${id}`, group);
    return response.data;
  },

  updateLeader: async (id: number, leaderId: number | null): Promise<Group> => {
    const response = await apiClient.put<Group>(`/groups/${id}/leader`, { leaderId });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/groups/${id}`);
  },

  getMembers: async (id: number): Promise<Engineer[]> => {
    const response = await apiClient.get<Engineer[]>(`/groups/${id}/members`);
    return response.data;
  },

  getMemberAssignments: async (id: number, from: string, to: string): Promise<GroupMemberAssignmentResponse> => {
    const response = await apiClient.get<GroupMemberAssignmentResponse>(`/groups/${id}/member-assignments`, {
      params: { from, to },
    });
    return response.data;
  },
};
