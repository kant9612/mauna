import apiClient from './client';
import type { Revenue, RevenueSummary, MonthlyRevenue, RevenueForecast, GrossProfitTrend } from '../types';

interface SummaryParams {
  yearMonth?: string;
  from?: string;
  to?: string;
}

interface MonthlyParams {
  from: string;
  to: string;
}

export const revenuesApi = {
  getAll: async (yearMonth?: string): Promise<Revenue[]> => {
    const params = yearMonth ? { yearMonth } : {};
    const response = await apiClient.get<Revenue[]>('/revenues', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Revenue> => {
    const response = await apiClient.get<Revenue>(`/revenues/${id}`);
    return response.data;
  },

  summarizeByDepartment: async (params: SummaryParams): Promise<RevenueSummary[]> => {
    const response = await apiClient.get<RevenueSummary[]>('/revenues/summary/by-department', { params });
    return response.data;
  },

  summarizeByGroup: async (params: SummaryParams): Promise<RevenueSummary[]> => {
    const response = await apiClient.get<RevenueSummary[]>('/revenues/summary/by-group', { params });
    return response.data;
  },

  summarizeByEngineer: async (params: SummaryParams): Promise<RevenueSummary[]> => {
    const response = await apiClient.get<RevenueSummary[]>('/revenues/summary/by-engineer', { params });
    return response.data;
  },

  getMonthlyTrend: async (params: MonthlyParams): Promise<MonthlyRevenue[]> => {
    const response = await apiClient.get<MonthlyRevenue[]>('/revenues/summary/monthly', { params });
    return response.data;
  },

  create: async (revenue: Omit<Revenue, 'id'>): Promise<Revenue> => {
    const response = await apiClient.post<Revenue>('/revenues', revenue);
    return response.data;
  },

  update: async (id: number, revenue: Omit<Revenue, 'id'>): Promise<Revenue> => {
    const response = await apiClient.put<Revenue>(`/revenues/${id}`, revenue);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/revenues/${id}`);
  },

  getForecast: async (yearMonth: string, groupBy: 'department' | 'group' | 'engineer' = 'department'): Promise<RevenueForecast[]> => {
    const response = await apiClient.get<RevenueForecast[]>('/revenues/forecast', {
      params: { yearMonth, groupBy },
    });
    return response.data;
  },

  getGrossProfitTrend: async (params: { from: string; to: string; groupBy?: 'total' | 'department' | 'group' }): Promise<GrossProfitTrend[]> => {
    const response = await apiClient.get<GrossProfitTrend[]>('/revenues/grossProfitTrend', { params });
    return response.data;
  },
};
