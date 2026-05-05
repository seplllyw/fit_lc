import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecordsStore } from '../stores/recordsStore';
import CalendarGrid from '../components/calendar/CalendarGrid';
import CalendarDetail from '../components/calendar/CalendarDetail';

export default function Calendar() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const { workouts, measurements, fetchWorkouts, fetchMeasurements } = useRecordsStore();
  const navigate = useNavigate();

  // Fetch data when year or month changes
  useEffect(() => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    fetchWorkouts(startDate, endDate);
    fetchMeasurements(startDate, endDate);
  }, [year, month, fetchWorkouts, fetchMeasurements]);

  // Memoized values
  const workoutDates = useMemo(
    () => new Set(workouts.map((w) => w.date)),
    [workouts]
  );

  const measurementDates = useMemo(
    () => new Set(measurements.map((m) => m.date)),
    [measurements]
  );

  const selectedWorkouts = useMemo(
    () => workouts.filter((w) => w.date === selectedDate),
    [workouts, selectedDate]
  );

  const selectedMeasurements = useMemo(
    () => measurements.filter((m) => m.date === selectedDate),
    [measurements, selectedDate]
  );

  // Navigation handlers
  const goToPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  const toggleDate = (date: string) => {
    setSelectedDate((prev) => (prev === date ? '' : date));
  };

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-text-secondary hover:text-text-primary"
        >
          返回
        </button>
        <h1 className="font-heading text-xl font-bold text-accent-orange">日历</h1>
        <button
          onClick={goToToday}
          className="text-accent-orange text-sm hover:text-accent-red"
        >
          今天
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="text-text-secondary hover:text-text-primary px-2"
        >
          ‹
        </button>
        <span className="font-heading text-lg">
          {year}年{month + 1}月
        </span>
        <button
          onClick={goToNextMonth}
          className="text-text-secondary hover:text-text-primary px-2"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <CalendarGrid
        year={year}
        month={month}
        workoutDates={workoutDates}
        measurementDates={measurementDates}
        selectedDate={selectedDate}
        onSelectDate={toggleDate}
      />

      {/* Detail panel */}
      {selectedDate && (
        <CalendarDetail
          date={selectedDate}
          workouts={selectedWorkouts}
          measurements={selectedMeasurements}
        />
      )}
    </div>
  );
}