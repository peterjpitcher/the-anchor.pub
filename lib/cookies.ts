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
    '_twitter_sess', 'personalization_id' // Twitter
  ];

  cookiesToRemove.forEach(cookieName => {
    // Try to delete with different path/domain combinations
    deleteCookie(cookieName);
    deleteCookie(cookieName, { path: '/' });
    deleteCookie(cookieName, { domain: '.the-anchor.pub' });
    deleteCookie(cookieName, { domain: 'the-anchor.pub' });
  });
}

