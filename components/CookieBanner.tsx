'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  hasUserConsented,
  acceptAllCookies,
  rejectAllCookies,
  setConsentStatus,
  getConsentStatus,
  COOKIE_SETTINGS_OPEN_EVENT,
  type CookieConsent
} from '@/lib/cookies';
import { trackCookieConsent } from '@/lib/gtm-events';
import { Button } from '@/components/ui';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFloatingLayer } from '@/hooks/useFloatingLayer';

/**
 * Published so the sticky Book a table bar can sit directly above this banner instead of
 * hiding until it is dismissed. Both are pinned to the bottom of the viewport, so without
 * a shared measurement one has to give way, and until now it was the booking button: a
 * first-time visitor could not see it at all until they answered the cookie prompt.
 *
 * A CSS variable rather than React state because the two components have no common
 * ancestor that re-renders, and the height is genuinely a layout fact rather than
 * application state. Measured rather than hardcoded because the banner wraps to two lines
 * on narrow screens and grows again when the preferences panel opens.
 */
const BANNER_HEIGHT_VAR = '--cookie-banner-height';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  // True from the moment the page knows no choice has been made, which is a
  // second before the bar is drawn (see the timer below), until one is made.
  // It is what the floating layer coordinator is told, so that nothing lower in
  // its order (the event card, a timed pop-up) appears in that second and is
  // then pushed out again.
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  // One floating layer at a time (lib/floating-layers.ts). While a dialog is
  // open (the quick booking sheet, the phone menu, an enquiry drawer) the bar
  // steps out, because it used to sit on the last control of each of them. It
  // comes back when the dialog closes. This changes where the bar is drawn and
  // nothing else: no choice is made, stored or assumed while it is away.
  const bannerMayShow = useFloatingLayer('cookie-banner', awaitingChoice);
  // Its own preferences panel is a dialog too, and covers the bar with a dark
  // layer. The bar stays under it, so "choose which cookies" is still there to
  // take focus back when the panel closes.
  const bannerOnScreen = showBanner && (bannerMayShow || showPreferences);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  // The panel is a modal dialog. This moves focus into it when it opens, keeps Tab inside
  // it, and hands focus back to whatever opened it (usually the footer's Cookie settings
  // control, a long way down the page) when it closes.
  const preferencesRef = useFocusTrap(showPreferences);

  // Read the stored choice every time the panel opens, so the switches show what is in
  // force now rather than whatever this component last held: Accept All and Reject All
  // never touch this state, and a switch flicked and then cancelled should not linger.
  const openPreferences = useCallback(() => {
    setConsent(getConsentStatus());
    setShowPreferences(true);
  }, []);

  // The banner only shows while no choice exists, so once one is made this event is the
  // way back in: the footer's Cookie settings control fires it on every page. Without it
  // the only way to withdraw consent was to clear the site's cookies in the browser.
  useEffect(() => {
    window.addEventListener(COOKIE_SETTINGS_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(COOKIE_SETTINGS_OPEN_EVENT, openPreferences);
  }, [openPreferences]);

  useEffect(() => {
    const root = document.documentElement;
    const clear = () => root.style.setProperty(BANNER_HEIGHT_VAR, '0px');

    if (!bannerOnScreen) {
      clear();
      return;
    }

    const node = bannerRef.current;
    if (!node) return;

    const publish = () => {
      root.style.setProperty(BANNER_HEIGHT_VAR, `${node.offsetHeight}px`);
    };
    publish();

    // The banner changes height when it wraps or when preferences expand, and the sticky
    // bar has to move with it rather than overlap it halfway through a transition.
    const observer = new ResizeObserver(publish);
    observer.observe(node);

    return () => {
      observer.disconnect();
      // Always reset on unmount. Leaving a stale height would push the sticky bar up off
      // the bottom of the screen on every subsequent page with no banner in sight.
      clear();
    };
  }, [bannerOnScreen, showPreferences]);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = hasUserConsented();
    const currentConsent = getConsentStatus();

    if (!hasConsented) {
      setAwaitingChoice(true);
      // Small delay to prevent banner from flashing on page load
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    setConsent(currentConsent);
  }, []);

  const handleAcceptAll = () => {
    acceptAllCookies();
    setShowBanner(false);
    setAwaitingChoice(false);
    trackCookieConsent({ action: 'accept_all', analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    rejectAllCookies();
    setShowBanner(false);
    setAwaitingChoice(false);
    trackCookieConsent({ action: 'reject_all', analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    setConsentStatus({
      analytics: consent?.analytics || false,
      marketing: consent?.marketing || false
    });
    setShowBanner(false);
    setAwaitingChoice(false);
    setShowPreferences(false);
    trackCookieConsent({
      action: 'save_preferences',
      analytics: consent?.analytics || false,
      marketing: consent?.marketing || false
    });
  };

  if (!showBanner && !showPreferences) return null;

  return (
    <>
      {/* The bar. One layout at every width, so the words and the buttons cannot drift apart
          between phone and desktop: they once did, and the phone version said only
          "We use cookies." */}
      {/* z-[90] keeps the banner above the sticky CTA bar (z-[80]), which now sits directly
          on top of it rather than waiting for it to be dismissed. */}
      {bannerOnScreen && (
        <div
          ref={bannerRef}
          className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line shadow-lg z-[90] animate-slide-up safe-area-inset-bottom"
        >
          <div className="mx-auto px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Every sentence here is a fact about the code. Nothing is switched on by
                  carrying on browsing: the old line said it was, and it never was true.
                  "They stay off unless you accept" is lib/cookies.ts (the default is off)
                  and GTMProvider (Tag Manager is not loaded until Accept). */}
              <div className="flex-1 text-xs sm:text-sm text-ink">
                <p className="font-medium text-ink-strong">Cookies: it&apos;s your choice</p>
                <p className="mt-0.5 sm:mt-1 text-ink-muted">
                  We&apos;d like to use cookies to see how our website is used and which of our adverts work. They stay off unless you accept. You can{' '}
                  {/* In the sentence, not a third button beside the other two: three
                      buttons did not fit a 320px phone (the last one ran off the
                      edge, measured 8 October 2026), and the only two things in the
                      button row are now the two answers, side by side and alike. */}
                  <button
                    type="button"
                    onClick={openPreferences}
                    className="underline hover:text-accent-text"
                  >
                    choose which cookies
                  </button>{' '}
                  or{' '}
                  <Link href="/privacy-policy" className="underline hover:text-accent-text">
                    read our privacy policy
                  </Link>
                  .
                </p>
              </div>

              {/* Reject and Accept are the same button: same variant, same size, same width
                  on a phone. Neither is made to look like the one you are meant to press.
                  tests/unit/cookie-banner-wording.test.tsx holds that. */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={handleRejectAll}
                  variant="primary"
                  size="sm"
                  className="min-h-[48px] flex-1 sm:flex-none"
                  aria-label="Reject all cookies"
                >
                  Reject all
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="primary"
                  size="sm"
                  className="min-h-[48px] flex-1 sm:flex-none"
                  aria-label="Accept all cookies"
                >
                  Accept all
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {/* z-[100], the layer the site's other modals use (components/ui/overlays/Modal.tsx).
          At z-[90] it tied with the event countdown card, which comes later in the page
          and so painted over the panel's text. The bar above stays at z-[90]. */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div
            ref={preferencesRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowPreferences(false);
            }}
            className="bg-surface border border-line rounded-t-md sm:rounded-md shadow-lg w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-none"
          >
            <div className="sticky top-0 bg-surface border-b border-line p-4 sm:p-6 flex items-center justify-between">
              <h2 id="cookie-preferences-title" className="text-lg sm:text-2xl font-bold text-ink-strong">Cookie Preferences</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 text-ink-muted hover:text-ink-strong hover:bg-surface-sunk rounded-sm transition-colors"
                aria-label="Close preferences"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Necessary Cookies - Always enabled */}
                <div className="border-b border-line pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-text">Necessary Cookies</h3>
                    <span className="text-sm text-ink-muted">Always Enabled</span>
                  </div>
                  {/* The one cookie set without a choice is anchor-cookie-consent
                      (lib/cookies.ts). There is no login and no "secure area". */}
                  <p className="text-sm text-ink">
                    One cookie of our own remembers the choice you make here, so we don&apos;t ask you again on every page. It can&apos;t be switched off.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b border-line pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 id="cookie-category-analytics" className="font-semibold text-accent-text">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.analytics || false}
                        aria-labelledby="cookie-category-analytics"
                        onChange={(e) => setConsent(prev => ({ ...prev!, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-sunk border border-line peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-anchor-gold-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anchor-green peer-checked:border-anchor-green"></div>
                    </label>
                  </div>
                  <p className="text-sm text-ink">
                    Google Analytics and Microsoft Clarity show us which pages people visit and how they use them, so we can make the website better. Both give your browser an identifier, and Clarity records how you scroll and click. Neither runs unless this is switched on.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 id="cookie-category-marketing" className="font-semibold text-accent-text">Marketing Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.marketing || false}
                        aria-labelledby="cookie-category-marketing"
                        onChange={(e) => setConsent(prev => ({ ...prev!, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-sunk border border-line peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-anchor-gold-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anchor-green peer-checked:border-anchor-green"></div>
                    </label>
                  </div>
                  <p className="text-sm text-ink">
                    These let us tell which of our adverts lead to bookings. We remember the advert that brought you here, and we tell Meta (Facebook and Instagram) about any booking you make. Meta&apos;s and LinkedIn&apos;s own tags, which tell them you visited, load only if analytics cookies are on too.
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  onClick={() => setShowPreferences(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSavePreferences}
                  variant="primary"
                  size="sm"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }

        @media (max-width: 640px) {
          .fixed.bottom-0 {
            bottom: env(safe-area-inset-bottom, 0);
          }
        }
      `}</style>
    </>
  );
}
