import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api/user';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const experienceOptions = [
  { value: 'beginner', label: '初学者' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' },
];

const goalOptions = [
  { value: 'bulk', label: '增肌' },
  { value: 'cut', label: '减脂' },
  { value: 'maintain', label: '维持' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const setHasOnboarded = useAuthStore((s) => s.setHasOnboarded);
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [bodyFat, setBodyFat] = useState('18');
  const [experience, setExperience] = useState('beginner');
  const [goal, setGoal] = useState('bulk');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.updateProfile({
        height: parseFloat(height),
        body_weight: parseFloat(weight),
        body_fat: bodyFat ? parseFloat(bodyFat) : undefined,
        experience: experience as 'beginner' | 'intermediate' | 'advanced',
        goal: goal as 'bulk' | 'cut' | 'maintain',
      });
      await userApi.setOnboarded();
      setHasOnboarded(true);
      navigate('/chat');
    } catch (err) {
      console.error('Onboarding failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="font-heading text-2xl font-bold text-accent-orange text-center mb-2">
          欢迎使用 FitLC
        </h1>
        <p className="text-text-secondary text-center mb-6">
          让我们先了解一下您的基本情况
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">身高 (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
                required
                min={150}
                max={220}
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">体重 (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
                required
                min={40}
                max={200}
              />
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">体脂率 (%) 可选</label>
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="18.5"
              className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
              step="0.1"
              min={5}
              max={50}
            />
          </div>

          <div>
            <label className="block text-text-secondary text-sm mb-1">训练经验</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-primary-secondary border-2 border-border rounded px-4 py-2 text-text-primary focus:outline-none focus:border-accent-orange"
            >
              {experienceOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

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

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
            {loading ? '保存中...' : '开始健身之旅'}
          </Button>
        </form>
      </Card>
    </div>
  );
}