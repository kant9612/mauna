import apiClient from './client';
import type { GradeMaster } from '../types';

export const gradesApi = {
  getAll: async (): Promise<GradeMaster[]> => {
    const response = await apiClient.get<GradeMaster[]>('/grade-masters');
    return response.data;
  },

  getById: async (id: number): Promise<GradeMaster> => {
    const response = await apiClient.get<GradeMaster>(`/grade-masters/${id}`);
    return response.data;
  },
};
