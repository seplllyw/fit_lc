import { FormEvent, useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { userApi } from '../api/user';
import Button from './ui/Button';
import { Dumbbell, Cable, Cog, User, Coffee, Zap, Circle } from 'lucide-react';

interface PlanFormProps {
  onSubmit: (data: UserProfile) => Promise<void>;
  isLoading?: boolean;
}

const goalOptions = [
  { value: 'bulk', label: '增肌' },
  { value: 'cut', label: '减脂' },
  { value: 'maintain', label: '维持' },
];

const EQUIPMENTS = [
  { id: 'barbell', label: '杠铃', icon: Dumbbell, color: 'text-orange-400' },
  { id: 'dumbbell', label: '哑铃', icon: Circle, color: 'text-blue-400' },
  { id: 'cable', label: '绳索', icon: Cable, color: 'text-green-400' },
  { id: 'machine', label: '器械', icon: Cog, color: 'text-gray-400' },
  { id: 'bodyweight', label: '自重', icon: User, color: 'text-purple-400' },
  { id: 'kettlebell', label: '壶铃', icon: Coffee, color: 'text-yellow-400' },
  { id: 'bands', label: '弹力带', icon: Zap, color: 'text-pink-400' },
];

export default function PlanForm({ onSubmit, isLoading }: PlanFormProps) {
  const [goal, setGoal] = useState('bulk');
  const [frequency, setFrequency] = useState(3);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['bodyweight']);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    userApi.getProfile().then(({ profile }) => {
      setUserProfile(profile);
      if (profile.goal) setGoal(profile.goal);
      if (profile.equipment) {
        const equipStr = profile.equipment;
        const equipArray = equipStr.includes(',')
          ? equipStr.split(',')
          : [equipStr];
        setSelectedEquipment(equipArray);
      }
    }).catch(console.error);
  }, []);

  const toggleEquipment = (id: string) => {
    setSelectedEquipment(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: UserProfile = {
      goal: goal as UserProfile['goal'],
      frequency,
      experience: (userProfile?.experience as UserProfile['experience']) || 'beginner',
      equipment: selectedEquipment.join(','),
      body_weight: userProfile?.body_weight || userProfile?.weight,
      height: userProfile?.height,
      body_fat: userProfile?.body_fat,
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

      <div>
        <label className="block text-text-secondary text-sm mb-2">可用器械</label>
        <div className="grid grid-cols-4 gap-2">
          {EQUIPMENTS.map(({ id, label, icon: Icon, color }) => {
            const isSelected = selectedEquipment.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleEquipment(id)}
                className={`flex flex-col items-center gap-1 p-3 rounded border-2 transition-all ${
                  isSelected
                    ? 'border-accent-orange bg-accent-orange/10'
                    : 'border-border bg-primary-secondary hover:border-border/80'
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? color : 'text-text-secondary'}`} />
                <span className={`text-xs ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? '生成中...' : '生成健身计划'}
      </Button>
    </form>
  );
}