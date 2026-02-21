import apiClient from './client';
import type { AssignmentSchedule, Engineer, Assignment } from '../types';

interface ScheduleParams {
  from: string;
  to: string;
}

export const assignmentsApi = {
  /**
   * 入場予定一覧を取得
   */
  getUpcomingEntries: async (params: ScheduleParams): Promise<AssignmentSchedule[]> => {
    const response = await apiClient.get<AssignmentSchedule[]>('/assignments/upcoming-entries', { params });
    return response.data;
  },

  /**
   * 退場予定一覧を取得
   */
  getUpcomingExits: async (params: ScheduleParams): Promise<AssignmentSchedule[]> => {
    const response = await apiClient.get<AssignmentSchedule[]>('/assignments/upcoming-exits', { params });
    return response.data;
  },

  /**
   * 入退場スケジュールを取得（カレンダー表示用）
   */
  getSchedule: async (params: ScheduleParams): Promise<AssignmentSchedule[]> => {
    const response = await apiClient.get<AssignmentSchedule[]>('/assignments/schedule', { params });
    return response.data;
  },

  /**
   * 待機メンバー一覧を取得（指定日時点で案件にアサインされていないエンジニア）
   */
  getStandbyEngineers: async (date: string): Promise<Engineer[]> => {
    const response = await apiClient.get<Engineer[]>('/assignments/standby-engineers', { params: { date } });
    return response.data;
  },

  /**
   * アサインを作成
   */
  create: async (assignment: Assignment): Promise<Assignment> => {
    const response = await apiClient.post<Assignment>('/assignments', assignment);
    return response.data;
  },

  /**
   * アサインを削除
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`);
  },
};
