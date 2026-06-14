/**
 * Status Bar Utility Functions
 * 
 * CRITICAL: Always use currentStatus for live state, never calculate from timetables
 * Timetables are for display/planning only, not for determining "now"
 */

export interface APIResponse {
  currentStatus: {
    isOpen: boolean;
    kitchenOpen: boolean;
    closesIn: string | null;
    opensIn: string | null;
    timestamp: string;
    currentTime?: string;
    services?: {
      venue: {
        open: boolean;
        closesIn: string | null;
      };
      kitchen: {
        open: boolean;
        closesIn: string | null;
      };
      bookings?: {
        accepting: boolean;
        availableSlots: string[];
      };
    };
    capacity?: {
      total: number;
      available: number;
      percentageFull: number;
    };
  };
  regularHours: {
    [day: string]: {
      opens: string;
      closes: string;
      kitchen?: {
        opens: string;
        closes: string;
        is_closed?: boolean;
      } | null;
      is_closed: boolean;
      is_kitchen_closed?: boolean;
    };
  };
  specialHours: Array<{
    date: string;
    opens?: string;
    closes?: string;
    is_closed: boolean;
    is_kitchen_closed?: boolean;
    status?: 'closed' | 'modified';
    reason?: string;
    note?: string;
    kitchen?: {
      opens: string;
      closes: string;
      is_closed?: boolean;
    } | null;
  }>;
  today?: {
    date: string;
    dayName: string;
    summary: string;
    isSpecialHours: boolean;
    events: Array<{
      title: string;
      time: string;
      affectsCapacity: boolean;
    }>;
  };
  timezone: string;
  lastUpdated: string;
}

export interface StatusBarDisplay {
  // Primary display
  stripText: string;
  stripVariant: 'open' | 'closed';
  stripColor: 'green' | 'red';
  
  // Kitchen status (null when venue closed)
  kitchenPill: string | null;
  kitchenVariant: 'open' | 'closed' | null;
  kitchenColor: 'green' | 'amber' | null;
  
  // Special hours indicator
  showSpecialBadge: boolean;
  specialNote?: string;
  
  // Booking CTA state
  bookingEnabled: boolean;
  bookingSlots: string[];
  
  // For debugging/monitoring
  debugInfo?: {
    isOpen: boolean;
    kitchenOpen: boolean;
    bookingAccepting: boolean;
    usingFallback: boolean;
    timestamp: string;
    lastUpdate: string;
  };
}

/**
 * Get today's date string in Europe/London timezone
 * Uses formatToParts to avoid locale parsing issues
 * @returns Date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
}

/**
 * Get today's day key for regularHours lookup
 * Uses formatToParts to avoid locale parsing issues
 * @returns Lowercase day name (e.g., "monday")
 */
export function getTodayKey(): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long'
  });
  
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find(p => p.type === 'weekday')?.value || 'monday';
  
  return weekday.toLowerCase();
}

/**
 * Format time from HH:mm:ss to display format
 * @param timeString Time in HH:mm:ss format
 * @param use24Hour Use 24-hour format (default true for UK)
 */
export function formatTime(timeString: string, use24Hour: boolean = true): string {
  const [hour, minute] = timeString.split(':').map(Number);
  
  if (use24Hour) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }
  
  // 12-hour format
  const period = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour > 12 ? hour - 12 : hour || 12;
  return minute === 0 
    ? `${displayHour}${period}` 
    : `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
}

/**
 * Get today's scheduled hours (for display only, not live state)
 * @param data API response
 * @returns Today's hours from special or regular schedule
 */
export function getTodaySchedule(data: APIResponse): any | null {
  const todayDate = getTodayDateString();
  
  // Check special hours first (they override regular hours)
  const special = data.specialHours.find(s => s.date === todayDate);
  if (special) {
    return special;
  }
  
  // Fall back to regular hours
  const todayKey = getTodayKey();
  return data.regularHours[todayKey] || null;
}

/**
 * Main utility to get status bar display data
 * 
 * GOLDEN RULE: currentStatus is truth, timetables are for display
 * 
 * @param data API response data
 * @param options Configuration options
 * @returns Formatted display data for status bar
 */
export function getStatusBarDisplay(
  data: APIResponse | null,
  options: { 
    debug?: boolean;
    showCountdown?: boolean;
  } = { showCountdown: true }
): StatusBarDisplay {
  // Handle no data case
  if (!data) {
    return {
      stripText: 'Opening hours unavailable',
      stripVariant: 'closed',
      stripColor: 'red',
      kitchenPill: null,
      kitchenVariant: null,
      kitchenColor: null,
      showSpecialBadge: false,
      specialNote: undefined,
      bookingEnabled: false,
      bookingSlots: []
    };
  }
  
  const { currentStatus, specialHours, today } = data;
  
  // ==========================
  // 1. VENUE STATUS (Primary)
  // ==========================
  let stripText: string;
  let stripVariant: 'open' | 'closed';
  let stripColor: 'green' | 'red';
  
  if (currentStatus.isOpen) {
    // VENUE IS OPEN
    stripVariant = 'open';
    stripColor = 'green';
    
    if (options.showCountdown && currentStatus.closesIn) {
      // Explicit "closes in" for clarity
      stripText = `Open, closes in ${currentStatus.closesIn}`;
    } else {
      stripText = 'Open';
    }
  } else {
    // VENUE IS CLOSED
    stripVariant = 'closed';
    stripColor = 'red';
    
    if (options.showCountdown && currentStatus.opensIn) {
      // Explicit "opens in" for clarity
      stripText = `Closed, opens in ${currentStatus.opensIn}`;
    } else {
      stripText = 'Closed';
    }
  }
  
  // ==========================
  // 2. KITCHEN STATUS
  // ==========================
  // Only show kitchen status when venue is open
  // GUARDRAIL: Always trust currentStatus.kitchenOpen over any timetable data
  let kitchenPill: string | null = null;
  let kitchenVariant: 'open' | 'closed' | null = null;
  let kitchenColor: 'green' | 'amber' | null = null;
  
  if (currentStatus.isOpen) {
    // Trust currentStatus.kitchenOpen as the single source of truth
    if (currentStatus.kitchenOpen) {
      // Kitchen is open
      kitchenVariant = 'open';
      kitchenColor = 'green';
      
      const kitchenClosesIn = currentStatus.services?.kitchen?.closesIn;
      if (options.showCountdown && kitchenClosesIn) {
        kitchenPill = `Kitchen open, closes in ${kitchenClosesIn}`;
      } else {
        kitchenPill = 'Kitchen open';
      }
    } else {
      // Kitchen is closed (but venue is open)
      kitchenVariant = 'closed';
      kitchenColor = 'amber';
      kitchenPill = 'Kitchen closed';
      
      // The currentStatus payload is the public source of truth here.
    }
  }
  // If venue is closed, kitchen status remains null (not displayed)
  
  // ==========================
  // 3. SPECIAL HOURS BADGE
  // ==========================
  // Compute once and reuse
  const todayDate = getTodayDateString();
  const todaySpecial = specialHours?.find(s => s.date === todayDate);
  const showSpecialBadge = today?.isSpecialHours === true || !!todaySpecial;
  
  // Surface the note or summary
  const specialNote = todaySpecial?.note || today?.summary;
  
  // ==========================
  // 4. BOOKING CTA STATE
  // ==========================
  const bookingEnabled = currentStatus.services?.bookings?.accepting === true;
  const bookingSlots = currentStatus.services?.bookings?.availableSlots || [];
  
  // Build result
  const result: StatusBarDisplay = {
    stripText,
    stripVariant,
    stripColor,
    kitchenPill,
    kitchenVariant,
    kitchenColor,
    showSpecialBadge,
    specialNote,
    bookingEnabled,
    bookingSlots
  };
  
  // Add debug info if requested
  if (options.debug) {
    result.debugInfo = {
      isOpen: currentStatus.isOpen,
      kitchenOpen: currentStatus.kitchenOpen,
      bookingAccepting: bookingEnabled,
      usingFallback: false,
      timestamp: currentStatus.timestamp || new Date().toISOString(),
      lastUpdate: data.lastUpdated || new Date().toISOString()
    };
  }
  
  return result;
}

/**
 * Format scheduled hours for display (NOT for live status)
 * @param hours Day hours object
 * @param includeKitchen Include kitchen hours in output
 */
export function formatScheduledHours(
  hours: any,
  includeKitchen: boolean = false
): string {
  if (!hours || hours.is_closed) {
    return 'Closed';
  }
  
  const venueHours = `${formatTime(hours.opens)}–${formatTime(hours.closes)}`;
  
  if (!includeKitchen || !hours.kitchen || hours.kitchen.is_closed) {
    return venueHours;
  }
  
  const kitchenHours = `Kitchen: ${formatTime(hours.kitchen.opens)}–${formatTime(hours.kitchen.closes)}`;
  return `${venueHours} (${kitchenHours})`;
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 * @param timestamp ISO timestamp string from API (use currentStatus.timestamp)
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/London'
  });
}

/**
 * Check if we should show a stale data warning
 * @param lastUpdate Last successful update time
 * @param threshold Staleness threshold in milliseconds (default 2 minutes)
 */
export function isDataStale(
  lastUpdate: Date | null, 
  threshold: number = 120000
): boolean {
  if (!lastUpdate) return false;
  return Date.now() - lastUpdate.getTime() > threshold;
}

/**
 * Handle rate limiting with exponential backoff
 * @param attemptNumber Current attempt number
 * @param maxDelay Maximum delay in milliseconds
 */
export function getBackoffDelay(
  attemptNumber: number, 
  maxDelay: number = 60000
): number {
  const delay = Math.min(1000 * Math.pow(2, attemptNumber), maxDelay);
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}
