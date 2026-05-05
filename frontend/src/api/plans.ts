import client from './client';
import type { Plan, UserProfile, ExecutionInput, ExecutionStats } from '../types';

export const plansApi = {
  async getPlans(): Promise<{ plans: Plan[] }> {
    const { data } = await client.get<{ plans: Plan[] }>('/plans');
    return data;
  },

  async getPlan(id: number): Promise<{ plan: Plan }> {
    const { data } = await client.get<{ plan: Plan }>(`/plans/${id}`);
    return data;
  },

  async generatePlan(userProfile: UserProfile, exercises: Plan['exercises']): Promise<{ planId: number; message: string }> {
    const { data } = await client.post<{ planId: number; message: string }>('/plans/generate', {
      userProfile,
      exercises,
    });
    return data;
  },

  async updatePlan(id: number, updates: Partial<Plan>): Promise<{ success: boolean }> {
    const { data } = await client.put<{ success: boolean }>(`/plans/${id}`, updates);
    return data;
  },

  async deletePlan(id: number): Promise<{ success: boolean }> {
    const { data } = await client.delete<{ success: boolean }>(`/plans/${id}`);
    return data;
  },

  async activatePlan(id: number): Promise<{ success: boolean }> {
    const { data } = await client.post<{ success: boolean }>(`/plans/${id}/activate`);
    return data;
  },

  async recordExecution(planId: number, execution: ExecutionInput): Promise<{ id: number; success: boolean }> {
    const { data } = await client.post<{ id: number; success: boolean }>(`/plans/${planId}/execute`, execution);
    return data;
  },

  async getPlanAnalysis(planId: number): Promise<ExecutionStats> {
    const { data } = await client.get<ExecutionStats>(`/plans/${planId}/analysis`);
    return data;
  },
};