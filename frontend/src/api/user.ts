import client from './client';

export interface UserProfile {
  id?: number;
  userId: number;
  nickname?: string;
  avatar?: string;
  height?: number;
}

export interface BodyMetric {
  id: number;
  date: string;
  weight: number;
  bodyFat?: number;
}

export interface MetricsResponse {
  records: BodyMetric[];
  total: number;
  page: number;
  limit: number;
}

export interface MeasurementLatest {
  measurements: {
    [key: string]: { value: number; date: string } | null;
  };
}

export interface MeasurementHistory {
  bodyPart: string;
  history: { value: number; date: string }[];
  pagination: { page: number; limit: number; total: number };
}

export const userApi = {
  async getProfile(): Promise<UserProfile | null> {
    const { data } = await client.get('/users/me/profile');
    return data;
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const { data: result } = await client.put('/users/me/profile', data);
    return result;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await client.put('/users/me/password', { oldPassword, newPassword });
  },

  async uploadAvatar(file: File): Promise<string> {
    const base64 = await fileToBase64(file);
    const ext = file.name.split('.').pop() || 'jpg';
    const { data } = await client.post('/users/me/avatar', { file: base64, ext });
    return data.url;
  },

  async getMetrics(page = 1, limit = 10): Promise<MetricsResponse> {
    const { data } = await client.get('/users/me/metrics', { params: { page, limit } });
    return data;
  },

  async addMetric(date: string, weight: number, bodyFat?: number): Promise<BodyMetric> {
    const { data } = await client.post('/users/me/metrics', { date, weight, bodyFat });
    return data;
  },

  async deleteAccount(password: string): Promise<void> {
    await client.delete('/users/me/account', { data: { password } });
  },

  async getMeasurementsLatest(): Promise<MeasurementLatest> {
    const { data } = await client.get('/users/me/measurements/latest');
    return data;
  },

  async getMeasurementsHistory(bodyPart: string, page = 1, limit = 10): Promise<MeasurementHistory> {
    const { data } = await client.get('/users/me/measurements/history', { params: { bodyPart, page, limit } });
    return data;
  },

  async setOnboarded(): Promise<void> {
    await client.patch('/users/me/profile/onboarded', { hasOnboarded: true });
  },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}