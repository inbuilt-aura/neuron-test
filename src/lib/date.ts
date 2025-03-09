import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {toZonedTime } from 'date-fns-tz';

export const INDIAN_TIMEZONE = 'Asia/Kolkata';

export function formatToIndianTime(dateString: string, formatStr: string = 'h:mm a') {
  try {
    const date = parseISO(dateString);
    const indianTime = toZonedTime(date, INDIAN_TIMEZONE);
    return format(indianTime, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatLastSeen(lastViewedDate: string) {
  try {
    const date = parseISO(lastViewedDate);
    const indianTime = toZonedTime(date, INDIAN_TIMEZONE);
    const now = toZonedTime(new Date(), INDIAN_TIMEZONE);
    
    // If it's today, show time in 12-hour format
    if (format(indianTime, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return `today at ${format(indianTime, 'h:mm a')}`;
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (format(indianTime, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return `yesterday at ${format(indianTime, 'h:mm a')}`;
    }
    
    // Otherwise show relative time
    return formatDistanceToNow(indianTime, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'recently';
  }
}

