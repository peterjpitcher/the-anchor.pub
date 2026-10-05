// Cookie consent management utilities
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
}

const CONSENT_COOKIE_NAME = 'anchor-cookie-consent';
const CONSENT_DURATION_DAYS = 365;

// Default consent state - only necessary cookies
const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  timestamp: new Date().toISOString()
};

export function getConsentStatus(): CookieConsent | null {
  try {
    const consent = getCookie(CONSENT_COOKIE_NAME);
    if (!consent) return null;
    
    const parsed = JSON.parse(consent as string);
    // Ensure necessary is always true
    parsed.necessary = true;
    return parsed;
  } catch (error) {
    console.error('Error parsing consent cookie:', error);
    return null;
  }
}

export function setConsentStatus(consent: Partial<CookieConsent>) {
  const currentConsent = getConsentStatus() || DEFAULT_CONSENT;
  const newConsent: CookieConsent = {
    ...currentConsent,
    ...consent,
    necessary: true, // Always true
    timestamp: new Date().toISOString()
  };

  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(newConsent), {
    maxAge: 60 * 60 * 24 * CONSENT_DURATION_DAYS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  // Trigger custom event, GTMProvider and AnalyticsProvider listen for this
  // and update consent state in GTM/Clarity respectively
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cookieConsentUpdate', { detail: newConsent }));
  }
}

export function acceptAllCookies() {
  setConsentStatus({
    analytics: true,
    marketing: true,
    preferences: true
  });
}

export function rejectAllCookies() {
  setConsentStatus({
    analytics: false,
    marketing: false,
    preferences: false
  });
  
  // Clean up existing non-necessary cookies
  cleanupCookies();
}

export function hasUserConsented(): boolean {
  return getConsentStatus() !== null;
}

// Asks CookieBanner to reopen its preferences panel so a choice already made can be
// changed or withdrawn. An event for the same reason as cookieConsentUpdate above: the
// footer control and the banner have no shared parent to hold the state. It opens the
// panel and nothing else; the choice is still read from and saved to the cookie here.
export const COOKIE_SETTINGS_OPEN_EVENT = 'cookieSettingsOpen';

export function openCookieSettings(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_OPEN_EVENT));
  }
}

export function canUseCookieCategory(category: CookieCategory): boolean {
  const consent = getConsentStatus();
  if (!consent) return category === 'necessary';
  return consent[category] === true;
}

// Helper to clean up cookies when consent is revoked
function cleanupCookies() {
  // List of known analytics/marketing cookies to remove
  const cookiesToRemove = [
    '_ga', '_gid', '_gat', '_gac_', // Google Analytics
    '_fbp', 'fr', // Facebook
    '_gcl_au', '_gcl_aw', // Google Ads
    'IDE', 'test_cookie', // DoubleClick
    '_twitter_sess', 'personalization_id', // Twitter
    'anchor-booking-attribution' // our own ad-click attribution (lib/booking-attribution.ts)
  ];

  cookiesToRemove.forEach(cookieName => {
    // Try to delete with different path/domain combinations
    deleteCookie(cookieName);
    deleteCookie(cookieName, { path: '/' });
    deleteCookie(cookieName, { domain: '.the-anchor.pub' });
    deleteCookie(cookieName, { domain: 'the-anchor.pub' });
  });
}

