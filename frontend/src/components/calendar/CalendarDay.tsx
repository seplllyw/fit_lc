interface CalendarDayProps {
  day: number;
  dateStr: string;
  hasRecord: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function CalendarDay({
  day,
  dateStr: _dateStr,
  hasRecord,
  isToday,
  isSelected,
  onClick,
}: CalendarDayProps) {
  return (
    <div className="relative w-10 h-10">
      <button
        type="button"
        onClick={onClick}
        className={`
          flex items-center justify-center
          text-sm
          ${isSelected
            ? 'bg-accent-orange text-white'
            : isToday
              ? 'border-2 border-accent-orange hover:bg-tertiary'
              : 'hover:bg-tertiary'
          }
        `}
      >
        {day}
      </button>
      {hasRecord && !isSelected && (
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-orange" />
      )}
    </div>
  );
}