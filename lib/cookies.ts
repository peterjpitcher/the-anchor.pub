// Cookie consent management utilities
import { getCookie, setCookie } from 'cookies-next';

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

  // Every choice is written here (Accept All, Reject All and the panel's Save), so this is
  // where a category that is off loses its cookies. It runs on every write rather than only
  // when a switch goes from on to off, so Reject All also clears what an earlier visit left
  // behind. After the event, so the tags are told to stop before their cookies go.
  TRACKED_CATEGORIES.forEach(category => {
    if (!newConsent[category]) removeTrackerCookies(category);
  });

  // The event above stops a tag from starting. It cannot stop one already running in the
  // page: on 5 October 2026, with marketing switched off and Google's consent mode saying
  // denied, LinkedIn's Insight Tag still sent a request for every page change and every
  // button pressed, and it has no off switch to call. A full page load is what stops it,
  // because the choice stored above is read before Tag Manager starts and the tag is never
  // started again. So reload when a category goes from on to off. Not when one is switched
  // on, and not on a first choice, where the default is off and nothing was running. Last,
  // so the page that loads next finds the choice stored and the cookies gone.
  const switchedOff = TRACKED_CATEGORIES.some(
    category => currentConsent[category] && !newConsent[category]
  );
  if (switchedOff && typeof window !== 'undefined') {
    window.location.reload();
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

type TrackedCategory = 'analytics' | 'marketing';

const TRACKED_CATEGORIES: TrackedCategory[] = ['analytics', 'marketing'];

// The cookies the site's tags set on our own domain, by the category that allows them.
// Google's, Microsoft's and LinkedIn's names are from their published cookie lists, checked
// on 5 October 2026; Meta's two are the ones lib/booking-attribution.ts reads. A prefix
// covers names that carry an id, which no fixed name can match: GA4's session cookie is
// "_ga_" plus the property's id.
//
// Only cookies on our own domain can be removed from here. The same companies keep others
// on their own domains (Meta's "fr", Google's "IDE" and "test_cookie" on doubleclick.net,
// LinkedIn's "bcookie" and "lidc", Microsoft's "MUID" and "CLID"). A page on this site can
// neither see nor delete those, so listing them here would only pretend to.
//
// The Tag Manager container decides which tags run. Add a tag there that sets a cookie on
// our domain and its name belongs here.
const TRACKER_COOKIES: Record<TrackedCategory, { names: string[]; prefixes: string[] }> = {
  analytics: {
    names: [
      '_ga', '_gid', '_gat', // Google Analytics
      '_clck', '_clsk' // Microsoft Clarity
    ],
    prefixes: ['_ga_', '_gat_'] // Google Analytics: GA4 session, named throttle
  },
  marketing: {
    names: [
      '_fbp', '_fbc', // Meta pixel
      'li_fat_id', 'li_giant', 'ln_or', 'oribi_cookie_test', 'oribili_user_guid', // LinkedIn Insight Tag
      'anchor-booking-attribution' // our own ad-click attribution (lib/booking-attribution.ts)
    ],
    prefixes: ['_gcl_', '_gac_'] // Google advert click and campaign cookies
  }
};

// A cookie can only be deleted by naming the domain it was set on, and the tags set theirs
// on the widest one the browser allows: ".the-anchor.pub" from www.the-anchor.pub. So try
// the host and each domain above it. The browser ignores any it would never have accepted,
// such as "vercel.app" from a preview address.
function candidateDomains(hostname: string): string[] {
  const labels = hostname.split('.');
  return labels.slice(0, -1).map((_, index) => labels.slice(index).join('.'));
}

function removeTrackerCookies(category: TrackedCategory) {
  if (typeof document === 'undefined') return;

  const { names, prefixes } = TRACKER_COOKIES[category];
  const present = document.cookie.split(';').map(pair => pair.split('=')[0].trim());
  const toRemove = present.filter(
    name => names.includes(name) || prefixes.some(prefix => name.startsWith(prefix))
  );
  if (toRemove.length === 0) return;

  const domains = candidateDomains(window.location.hostname);
  toRemove.forEach(name => {
    // Written straight to document.cookie: a name we did not choose must not be able to
    // throw here, and the browser simply ignores a line it will not accept.
    document.cookie = `${name}=; path=/; max-age=0`;
    domains.forEach(domain => {
      document.cookie = `${name}=; path=/; domain=${domain}; max-age=0`;
    });
  });
}

