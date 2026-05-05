import { FormEvent, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { userApi } from '../api/user';
import Button from './ui/Button';

interface PlanFormProps {
  onSubmit: (data: UserProfile) => Promise<void>;
  isLoading?: boolean;
}

const goalOptions = [
  { value: 'bulk', label: '增肌' },
  { value: 'cut', label: '减脂' },
  { value: 'maintain', label: '维持' },
];

export default function PlanForm({ onSubmit, isLoading }: PlanFormProps) {
  const [goal, setGoal] = useState('bulk');
  const [frequency, setFrequency] = useState(3);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    userApi.getProfile().then(({ profile }) => {
      setUserProfile(profile);
      if (profile.goal) setGoal(profile.goal);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: UserProfile = {
      goal: goal as UserProfile['goal'],
      frequency,
      experience: (userProfile?.experience as UserProfile['experience']) || 'beginner',
      equipment: userProfile?.equipment || '徒手',
      body_weight: userProfile?.weight,
      height: userProfile?.height,
      bodyFat: userProfile?.bodyFat,
      duration_weeks: 12,
    };
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-text-secondary text-sm mb-1">训练目标</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
          >
            {goalOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-secondary text-sm mb-1">每周训练次数</label>
          <input
            type="number"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
            min={1}
            max={7}
            className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
          />
        </div>
      </div>

      <div className="text-text-secondary text-sm bg-primary-secondary p-3 rounded">
        <p>身高: {userProfile?.height || '—'} cm | 体重: {userProfile?.weight || '—'} kg</p>
        <p>训练经验: {userProfile?.experience === 'beginner' ? '初学' : userProfile?.experience === 'intermediate' ? '中级' : '高级'}</p>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? '生成中...' : '生成健身计划'}
      </Button>
    </form>
  );
}