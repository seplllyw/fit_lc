import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRecordsStore } from '../stores/recordsStore';
import { useAchievementStore } from '../stores/achievementStore';
import { userApi } from '../api/user';
import Card from '../components/ui/Card';
import StatCard from '../components/dashboard/StatCard';

export default function Profile() {
  const { recentWorkouts, fetchWorkouts } = useRecordsStore();
  const { stats: achievementStats } = useAchievementStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchWorkouts();
    setLoading(false);
  }, [fetchWorkouts]);

  useEffect(() => {
    userApi.getProfile().then(({ profile }) => setProfile(profile)).catch(console.error);
  }, []);

  const totalWorkouts = achievementStats['total_workouts']?.value || 0;
  const streakDays = achievementStats['streak_days']?.value || 0;

  // 日历入口
  const calendarLink = {
    streakDays,
    to: '/calendar'
  };

  return (
    <div className="px-6 py-4">
      <h1 className="font-heading text-3xl font-bold mb-6">我的</h1>

      {/* 个人信息卡片 */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-heading text-lg font-semibold text-text-primary">基本信息</h2>
          <button className="text-accent-orange text-sm">编辑</button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-accent-orange">{profile?.height || '—'}</div>
            <div className="text-text-secondary text-sm">身高(cm)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-orange">{profile?.weight || '—'}</div>
            <div className="text-text-secondary text-sm">体重(kg)</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent-orange">{profile?.bodyFat || '—'}</div>
            <div className="text-text-secondary text-sm">体脂(%)</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <span className="text-text-secondary">训练经验: </span>
            <span className="text-text-primary">
              {profile?.experience === 'beginner' ? '初学' : profile?.experience === 'intermediate' ? '中级' : '高级'}
            </span>
          </div>
          <div>
            <span className="text-text-secondary">目标: </span>
            <span className="text-text-primary">
              {profile?.goal === 'bulk' ? '增肌' : profile?.goal === 'cut' ? '减脂' : '维持'}
            </span>
          </div>
        </div>
      </Card>

      {/* 快速入口 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Link
          to="/settings"
          className="flex flex-col items-center gap-2 p-4 bg-tertiary rounded border border-border hover:border-accent-orange transition-colors"
        >
          <span className="text-2xl">⚙️</span>
          <div className="text-center">
            <div className="text-text-primary text-sm">设置</div>
          </div>
        </Link>

        <Link
          to="/security"
          className="flex flex-col items-center gap-2 p-4 bg-tertiary rounded border border-border hover:border-accent-orange transition-colors"
        >
          <span className="text-2xl">🔐</span>
          <div className="text-center">
            <div className="text-text-primary text-sm">安全</div>
          </div>
        </Link>

        <Link
          to="/badges"
          className="flex flex-col items-center gap-2 p-4 bg-tertiary rounded border border-border hover:border-accent-orange transition-colors"
        >
          <span className="text-2xl">🏆</span>
          <div className="text-center">
            <div className="text-text-primary text-sm">徽章</div>
          </div>
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard title="累计训练" value={loading ? '—' : totalWorkouts} unit="次" icon="🔥" />
      </div>

      {/* 连续打卡入口 */}
      <Link
        to={calendarLink.to}
        className="block p-4 bg-tertiary rounded border border-border hover:border-accent-orange transition-colors mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">📅</span>
          <span className="text-text-primary font-semibold">连续打卡</span>
        </div>
        <div className="text-text-secondary text-sm">
          当前连续 {loading ? '—' : streakDays} 天
        </div>
      </Link>

      {/* 最近训练 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-text-primary">最近训练</h2>
          <Link
            to="/history?tab=history"
            className="text-accent-orange text-sm hover:text-accent-red transition-colors"
          >
            查看全部
          </Link>
        </div>
        {recentWorkouts.length === 0 ? (
          <p className="text-text-secondary text-center py-8">暂无训练记录</p>
        ) : (
          <>
            {recentWorkouts.slice(0, 5).map((workout) => {
              const firstExercise = workout.exercises?.[0];
              const totalSets = firstExercise?.sets?.length || 0;
              const totalReps = firstExercise?.sets?.reduce((sum, s) => sum + s.reps, 0) || 0;
              return (
                <div key={workout.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-text-primary">
                      {firstExercise?.exerciseName || '训练'}
                    </p>
                    <p className="text-text-secondary text-sm">
                      {new Date(workout.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right text-text-secondary text-sm">
                    {totalSets}组 × {totalReps}次
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Card>
    </div>
  );
}
