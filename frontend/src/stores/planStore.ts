import { create } from 'zustand';
import { plansApi } from '../api/plans';
import type { Plan, UserProfile, ExecutionInput, ExecutionStats } from '../types';

interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;
  analysis: ExecutionStats | null;
  fetchPlans: () => Promise<void>;
  fetchPlan: (id: number) => Promise<void>;
  generatePlan: (userProfile: UserProfile, exercises: Plan['exercises']) => Promise<{ planId: number; message: string }>;
  updatePlan: (id: number, updates: Partial<Plan>) => Promise<void>;
  deletePlan: (id: number) => Promise<void>;
  activatePlan: (id: number) => Promise<void>;
  recordExecution: (planId: number, execution: ExecutionInput) => Promise<void>;
  fetchAnalysis: (planId: number) => Promise<void>;
}

export const usePlanStore = create<PlanState>((set) => ({
  plans: [],
  currentPlan: null,
  isLoading: false,
  error: null,
  analysis: null,

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const { plans } = await plansApi.getPlans();
      set({ plans, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchPlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { plan } = await plansApi.getPlan(id);
      set({ currentPlan: plan, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  generatePlan: async (userProfile, exercises) => {
    set({ isLoading: true, error: null });
    try {
      const result = await plansApi.generatePlan(userProfile, exercises);
      set({ isLoading: false });
      return result;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updatePlan: async (id, updates) => {
    try {
      await plansApi.updatePlan(id, updates);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        currentPlan: state.currentPlan?.id === id ? { ...state.currentPlan, ...updates } : state.currentPlan,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deletePlan: async (id) => {
    try {
      await plansApi.deletePlan(id);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  activatePlan: async (id) => {
    try {
      await plansApi.activatePlan(id);
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, status: 'active' as const } : p)),
        currentPlan: state.currentPlan?.id === id ? { ...state.currentPlan, status: 'active' as const } : state.currentPlan,
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  recordExecution: async (planId, execution) => {
    try {
      await plansApi.recordExecution(planId, execution);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  fetchAnalysis: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const analysis = await plansApi.getPlanAnalysis(planId);
      set({ analysis, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));