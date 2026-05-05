import type { Workout, Measurement } from '../../types';

interface CalendarDetailProps {
  date: string; // 'YYYY-MM-DD' format
  workouts: Workout[];
  measurements: Measurement[];
}

export default function CalendarDetail({
  date,
  workouts,
  measurements,
}: CalendarDetailProps) {
  // Parse date to display "m月d日" format
  // Use T12:00:00 to avoid timezone issues when parsing YYYY-MM-DD format
  const dateObj = new Date(date + 'T12:00:00');
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const dateDisplay = `${month}月${day}日`;

  const hasRecords = workouts.length > 0 || measurements.length > 0;

  return (
    <div className="mt-4 border-t-2 border-border pt-4">
      <h3 className="text-center text-text-secondary mb-4">
        -- -- -- {dateDisplay} -- -- -- -- -- --
      </h3>

      {!hasRecords && (
        <div className="text-center text-text-secondary">暂无记录</div>
      )}

      {workouts.length > 0 && (
        <div className="mb-4">
          <h4 className="text-text-primary font-semibold mb-2">训练记录</h4>
          {workouts.map((workout) =>
            workout.exercises.map((e) => {
              const totalSets = e.sets?.length || 0;
              const totalReps = e.sets?.reduce((sum, s) => sum + s.reps, 0) || 0;

              if (e.duration !== undefined) {
                return (
                  <div key={`${workout.id}-${e.id}`} className="text-text-secondary text-sm mb-1">
                    🏃 {e.exerciseName} {e.duration}分钟
                  </div>
                );
              }
              if (e.distance !== undefined) {
                return (
                  <div key={`${workout.id}-${e.id}`} className="text-text-secondary text-sm mb-1">
                    🏃 {e.exerciseName} {e.distance}公里
                  </div>
                );
              }
              return (
                <div key={`${workout.id}-${e.id}`} className="text-text-secondary text-sm mb-1">
                  🏋️ {e.exerciseName} {totalSets}组×{totalReps}次
                </div>
              );
            })
          )}
        </div>
      )}

      {measurements.length > 0 && (
        <div>
          <h4 className="text-text-primary font-semibold mb-2">围度记录</h4>
          {measurements.map((measurement) => (
            <div key={measurement.id} className="text-text-secondary text-sm mb-1">
              📏 {measurement.items.map((i) => `${i.bodyPart}: ${i.value}`).join(' / ')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}