/**
 * Date utility helper functions for analytics reporting.
 */

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ComparisonDateRange {
  current: DateRange;
  previous: DateRange;
}

/**
 * Calculates start and end Date objects for a given period,
 * along with the matching previous period of equal duration for comparison.
 * 
 * @param period - The preset range ('today' | '7d' | '30d' | '90d' | 'custom')
 * @param from - Custom ISO date string for start (used if period is 'custom')
 * @param to - Custom ISO date string for end (used if period is 'custom')
 */
export function getComparisonDateRanges(
  period: 'today' | '7d' | '30d' | '90d' | 'custom',
  from?: Date,
  to?: Date
): ComparisonDateRange {
  const now = new Date();
  let startDate = new Date();
  const endDate = new Date(now);

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'custom':
      if (from && to) {
        startDate = new Date(from);
        endDate.setTime(new Date(to).getTime());
      } else {
        startDate.setDate(now.getDate() - 30);
      }
      break;
  }

  // Calculate duration of the current period in milliseconds
  const durationMs = endDate.getTime() - startDate.getTime();

  // Previous period will have the exact same duration, ending right before the current starts
  const prevEndDate = new Date(startDate.getTime() - 1);
  const prevStartDate = new Date(prevEndDate.getTime() - durationMs);

  return {
    current: { startDate, endDate },
    previous: { startDate: prevStartDate, endDate: prevEndDate },
  };
}

/**
 * Generates an array of formatted date strings YYYY-MM-DD representing daily intervals
 * between startDate and endDate.
 */
export function generateDateSlots(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    dates.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}
