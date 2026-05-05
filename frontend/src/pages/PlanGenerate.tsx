import { useNavigate } from 'react-router-dom';
import { usePlanStore } from '../stores/planStore';
import { useToastStore } from '../stores/toastStore';
import PlanForm from '../components/PlanForm';
import Card from '../components/ui/Card';
import type { UserProfile } from '../types';

export default function PlanGenerate() {
  const navigate = useNavigate();
  const { generatePlan, isLoading } = usePlanStore();
  const { addToast } = useToastStore();

  const handleSubmit = async (data: UserProfile) => {
    try {
      const result = await generatePlan(data, undefined);
      addToast('计划已生成', 'success');
      navigate(`/plans/${result.planId}`);
    } catch {
      addToast('生成失败，请重试', 'error');
    }
  };

  return (
    <div className="px-6 py-4 max-w-3xl mx-auto">
      <h1 className="font-heading text-3xl font-bold mb-6">生成健身计划</h1>

      <Card>
        <p className="text-text-secondary mb-6">
          请填写您的基本信息和训练目标，我们将为您生成个性化的健身计划。
        </p>
        <PlanForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>
    </div>
  );
}