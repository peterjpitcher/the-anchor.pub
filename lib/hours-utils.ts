// Unified utilities for business hours and kitchen status
// Single source of truth matching Management API logic

// Match the actual API structure
type KitchenOpen = {
  opens: string;
  closes: string;
};

type KitchenClosed = {
  is_closed: true;
};

type KitchenStatus = KitchenOpen | KitchenClosed | null;

type DayHours = {
  opens?: string | null;
  closes?: string | null;
  kitchen?: KitchenStatus;
  is_closed?: boolean;
  is_kitchen_closed?: boolean;
};

type SpecialDay = {
  date: string;
  opens?: string | null;
  closes?: string | null;
  kitchen?: KitchenStatus;
  status?: 'modified' | 'closed';
  note?: string;
  reason?: string;
  is_closed?: boolean;
  // May not include explicit is_kitchen_closed; treat kitchen: null as closed
};

/**
 * Get the effective hours for a specific date, accounting for special hours
 * Special hours completely override regular hours when present
 */
export function getEffectiveDayHours(
  dateStr: string,
  regularHours: Record<string, DayHours>,
  specialHours?: SpecialDay[]
): DayHours {
  const date = new Date(`${dateStr}T12:00:00`);
  const key = date.toLocaleDateString('en-GB', { weekday: 'long' }).toLowerCase(); // 'monday'..'sunday'
  const base = regularHours[key] || {};
  const special = specialHours?.find(s => s.date === dateStr);

  if (!special) return base;

  // Special hours override regular hours completely when present
  return {
    opens: special.opens ?? base.opens ?? null,
    closes: special.closes ?? base.closes ?? null,
    kitchen: special.kitchen ?? null,
    is_closed: special.status === 'closed' ? true : base.is_closed ?? false,
    // No explicit flag in specials: if kitchen is null, treat as closed
    is_kitchen_closed:
      (special.kitchen == null) ||
      (base.is_kitchen_closed ?? false),
  };
}

/**
 * Check if kitchen is closed based on effective hours
 * Uses explicit flag first, then checks if kitchen is null or has is_closed flag
 */
export function isKitchenClosed(effective: DayHours): boolean {
  // Explicit flag is the source of truth
  if (typeof effective.is_kitchen_closed === 'boolean') {
    return effective.is_kitchen_closed;
  }
  
  // If no explicit flag, check if kitchen is null (means closed)
  if (effective.kitchen == null) return true;
  
  // Check if kitchen has is_closed flag (KitchenClosed type)
  if (typeof effective.kitchen === 'object' && 'is_closed' in effective.kitchen) {
    return effective.kitchen.is_closed === true;
  }

  // Some API responses provide opens/closes keys but leave them empty/null when closed
  if (
    typeof effective.kitchen === 'object' &&
    'opens' in effective.kitchen &&
    'closes' in effective.kitchen
  ) {
    const opens = (effective.kitchen as any).opens;
    const closes = (effective.kitchen as any).closes;
    
    if (!opens || !closes) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if venue is closed
 */
export function isVenueClosed(effective: DayHours): boolean {
  return effective.is_closed === true;
}

/**
 * Normalize UK phone number to E.164 format
 * Handles various UK formats and ensures consistent +44 prefix
 */
export function normaliseUKPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('44')) return `+${digits}`;           // 44...
  if (digits.startsWith('0')) return `+44${digits.slice(1)}`; // 0...
  if (digits.length === 10) return `+44${digits}`;            // 7xxxxxxxxx
  return `+${digits}`;
}

/**
 * Convert time string with seconds to HH:mm format
 * "16:00:00" -> "16:00"
 */
export function formatTimeNoSeconds(time: string): string {
  if (!time) return '';
  const parts = time.split(':');
  return `${parts[0]}:${parts[1]}`;
}

/**
 * Parse time string to decimal hours for calculations
 * "16:30" or "16:30:00" -> 16.5
 */
export function parseTimeToDecimal(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return hours + minutes / 60;
}
