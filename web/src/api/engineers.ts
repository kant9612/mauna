import apiClient from './client';
import type { Engineer, AssignmentSchedule } from '../types';

export const engineersApi = {
  getAll: async (): Promise<Engineer[]> => {
    const response = await apiClient.get<Engineer[]>('/engineers');
    return response.data;
  },

  getById: async (id: number): Promise<Engineer> => {
    const response = await apiClient.get<Engineer>(`/engineers/${id}`);
    return response.data;
  },

  create: async (engineer: Omit<Engineer, 'id'>): Promise<Engineer> => {
    const response = await apiClient.post<Engineer>('/engineers', engineer);
    return response.data;
  },

  update: async (id: number, engineer: Omit<Engineer, 'id'>): Promise<Engineer> => {
    const response = await apiClient.put<Engineer>(`/engineers/${id}`, engineer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/engineers/${id}`);
  },

  getAssignments: async (id: number): Promise<AssignmentSchedule[]> => {
    const response = await apiClient.get<AssignmentSchedule[]>(`/engineers/${id}/assignments`);
    return response.data;
  },
};
