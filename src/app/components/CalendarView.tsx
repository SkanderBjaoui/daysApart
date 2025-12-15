import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Cat, Rabbit } from 'lucide-react';

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes glow-pink {
    0%, 100% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3); }
    50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.5); }
  }
  
  @keyframes glow-blue {
    0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
    50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5); }
  }
  
  @keyframes glow-pink-blue {
    0%, 100% { box-shadow: 0 0 10px rgba(236, 72, 153, 0.5), 0 0 20px rgba(59, 130, 246, 0.5); }
    50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8), 0 0 30px rgba(59, 130, 246, 0.8); }
  }
  
  @keyframes glow-gray {
    0%, 100% { box-shadow: 0 0 10px rgba(156, 163, 175, 0.5), 0 0 20px rgba(156, 163, 175, 0.3); }
    50% { box-shadow: 0 0 20px rgba(156, 163, 175, 0.8), 0 0 30px rgba(156, 163, 175, 0.5); }
  }

  .animate-glow-pink { animation: glow-pink 2s ease-in-out infinite; }
  .animate-glow-blue { animation: glow-blue 2s ease-in-out infinite; }
  .animate-glow-pink-blue { animation: glow-pink-blue 2s ease-in-out infinite; }
  .animate-glow-gray { animation: glow-gray 2s ease-in-out infinite; }
`;
document.head.appendChild(style);

interface Contribution {
  date: string;
  author_id: string;
}

interface CalendarViewProps {
  contributions: Contribution[];
  totalDays: number;
  onDayClick: (date: string) => void;
  targetDate?: string; // target_date from couples table
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  contributions,
  totalDays,
  onDayClick,
  targetDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());


  // Ensure we're showing the current month
  useEffect(() => {
    setCurrentMonth(new Date());
  }, []);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const today = new Date();
  
  // Calculate start date: first contribution or today if no contributions
  const firstContributionDate = contributions.length > 0 
    ? new Date(Math.min(...contributions.map(m => new Date(m.date).getTime())))
    : today;
  
  // Calculate end date: target_date or today + totalDays
  const endDate = targetDate 
    ? new Date(targetDate)
    : new Date(today.getTime() + (totalDays * 24 * 60 * 60 * 1000));


  const getDayInfo = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    // Normalize dates to midnight for proper comparison
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedFirstContribution = new Date(firstContributionDate.getFullYear(), firstContributionDate.getMonth(), firstContributionDate.getDate());
    const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Use local timezone to avoid date shift
    const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
    const isToday = normalizedDate.getTime() === normalizedToday.getTime();
    const isFuture = normalizedDate > normalizedToday;
    const isInRange = normalizedDate >= normalizedFirstContribution && normalizedDate <= normalizedEnd;

    const daysUntil = Math.ceil((normalizedDate.getTime() - normalizedToday.getTime()) / (1000 * 60 * 60 * 24));
    const isHalfway = daysUntil === Math.floor(totalDays / 2);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()) {
      // Today logic
    }

    return { isToday, isFuture, isInRange, dateStr, daysUntil, isHalfway, isWeekend };
  };

  const renderDay = (day: number) => {
    const { isToday, isFuture, isInRange, dateStr, daysUntil, isHalfway, isWeekend } = getDayInfo(day);
    
    // Get all contributions for this day
    const dayContributions = contributions.filter(c => c.date === dateStr);
    const partner1Contribution = dayContributions.find(c => c.author_id === '00000000-0000-0000-0000-000000000001');
    const partner2Contribution = dayContributions.find(c => c.author_id === '00000000-0000-0000-0000-000000000002');

    return (
      <div
        key={day}
        onClick={() => isInRange && onDayClick(dateStr)}
        className={`
          aspect-square rounded-2xl p-3 relative transition-all duration-300 cursor-pointer
          ${!isInRange ? 'opacity-20 blur-sm cursor-not-allowed' : ''}
          ${isToday ? 'ring-4 ring-[var(--primary)] animate-pulse' : ''}
          ${partner1Contribution && partner2Contribution ? 'animate-glow-pink-blue' : ''}
          ${partner1Contribution && !partner2Contribution ? 'animate-glow-pink' : ''}
          ${partner2Contribution && !partner1Contribution ? 'animate-glow-blue' : ''}
          ${dayContributions.length === 0 && isToday ? 'animate-glow-gray' : ''}
          ${dayContributions.length === 0 && !isToday ? 'border-2 border-gray-300' : ''}
          ${isInRange && dayContributions.length === 0 && !isToday ? 'hover:bg-gray-50' : ''}
          ${isWeekend ? 'border-2 border-[var(--muted-foreground)]/30' : ''}
          hover:scale-105 hover:shadow-lg
        `}
      >
        {/* Day number */}
        <div className="text-sm text-[var(--foreground)] mb-2">{day}</div>

        {/* Future days countdown */}
        {isFuture && isInRange && (
          <div className="text-xs text-[var(--muted-foreground)] text-center">
            {daysUntil}d
          </div>
        )}

        {/* Halfway marker with cat */}
        {isHalfway && (
          <div className="absolute top-1 right-1">
            <Cat className="w-4 h-4 text-[var(--primary)]" />
          </div>
        )}

        {/* Weekend marker with bunny */}
        {isWeekend && isInRange && (
          <div className="absolute top-1 left-1">
            <Rabbit className="w-3 h-3 text-[var(--secondary)]" />
          </div>
        )}

        {/* Contribution entries with user images */}
        {dayContributions.length > 0 && (
          <div className={`absolute ${dayContributions.length === 2 ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-1' : 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'}`}>
            {partner1Contribution && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)] flex items-center justify-center text-white text-xs font-medium shadow-md">
                N
              </div>
            )}
            {partner2Contribution && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--secondary)] flex items-center justify-center text-white text-xs font-medium shadow-md">
                S
              </div>
            )}
          </div>
        )}
        {/* Contribution tooltip on hover */}
        {dayContributions.length > 0 && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/80 text-white text-xs rounded-lg px-2 py-1 opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {dayContributions.length === 1 
              ? `${dayContributions[0].author_id === '00000000-0000-0000-0000-000000000001' ? 'Nour' : 'Skander'} - 1 contribution`
              : `Both partners - ${dayContributions.length} contributions`
            }
          </div>
        )}
      </div>
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-[var(--pastel-pink)]/20 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[var(--primary)]" />
        </button>
        <h2 className="text-[var(--foreground)]">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-[var(--pastel-pink)]/20 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-[var(--primary)]" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm text-[var(--muted-foreground)] py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => renderDay(i + 1))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--pastel-pink)] to-[var(--primary)] animate-glow-pink" />
            <span className="text-[var(--muted-foreground)]">Nour checked in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--pastel-blue)] to-[var(--secondary)] animate-glow-blue" />
            <span className="text-[var(--muted-foreground)]">Skander checked in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[var(--pastel-pink)]/50 to-[var(--pastel-blue)]/50 animate-glow-pink-blue" />
            <span className="text-[var(--muted-foreground)]">Both checked in</span>
          </div>
          <div className="flex items-center gap-2">
            <Cat className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-[var(--muted-foreground)]">Halfway point</span>
          </div>
          <div className="flex items-center gap-2">
            <Rabbit className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-[var(--muted-foreground)]">Weekend</span>
          </div>
        </div>
      </div>
    </div>
  );
};
