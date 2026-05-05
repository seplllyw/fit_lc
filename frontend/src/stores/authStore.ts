import { create } from 'zustand';
import { authApi } from '../api/auth';
import { coachApi } from '../api/records';
import { userApi } from '../api/user';
import type { User } from '../types';

interface CoachConfig {
  enabled: boolean;
  reminderTime: string | null;
  maxDailyMessages: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  coachConfig: CoachConfig | null;
  hasOnboarded: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  fetchCoachConfig: () => Promise<void>;
  updateCoachConfig: (config: Partial<CoachConfig>) => Promise<void>;
  setHasOnboarded: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  coachConfig: null,
  hasOnboarded: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      // 解析 token 获取 roles (JWT 使用 base64url 编码)
      const base64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));
      const roles = payload.roles || [];
      localStorage.setItem('token', token);
      set({ token, user: { ...user, roles }, isAuthenticated: true, isLoading: false });
      // Fetch profile to get hasOnboarded status
      const { profile } = await userApi.getProfile();
      set({ hasOnboarded: profile?.hasOnboarded ?? false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '登录失败', isLoading: false });
      throw err;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.register(email, password);
      localStorage.setItem('token', token);
      set({ token, user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || '注册失败', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, coachConfig: null, hasOnboarded: false });
  },

  fetchCoachConfig: async () => {
    const config = await coachApi.getConfig();
    set({ coachConfig: config });
  },

  updateCoachConfig: async (config: Partial<CoachConfig>) => {
    const updated = await coachApi.updateConfig(config as { enabled?: boolean; reminderTime?: string; maxDailyMessages?: number });
    set({ coachConfig: updated });
  },

  setHasOnboarded: (value: boolean) => set({ hasOnboarded: value }),

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }
    try {
      const { user } = await authApi.getCurrentUser();
      // 解析 token 获取 roles (JWT 使用 base64url 编码)
      const base64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));
      const roles = payload.roles || [];
      set({ user: { ...user, roles }, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ isAuthenticated: false });
    }
  },
}));