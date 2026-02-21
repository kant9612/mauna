import apiClient from './client';
import type { Project, ResourceShortageAlert, AssignmentSchedule } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects');
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (project: Project): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', project);
    return response.data;
  },

  update: async (id: number, project: Project): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}`, project);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  getResourceShortages: async (): Promise<ResourceShortageAlert[]> => {
    const response = await apiClient.get<ResourceShortageAlert[]>('/projects/alerts/resource-shortage');
    return response.data;
  },

  getMembers: async (id: number): Promise<AssignmentSchedule[]> => {
    const response = await apiClient.get<AssignmentSchedule[]>(`/projects/${id}/members`);
    return response.data;
  },
};
