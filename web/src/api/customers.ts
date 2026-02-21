import apiClient from './client';
import type { Customer } from '../types';

export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    const response = await apiClient.get<Customer[]>('/customers');
    return response.data;
  },

  getById: async (id: number): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  },

  create: async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers', customer);
    return response.data;
  },

  update: async (id: number, customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await apiClient.put<Customer>(`/customers/${id}`, customer);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
};
