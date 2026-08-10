'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  hasUserConsented, 
  acceptAllCookies, 
  rejectAllCookies, 
  setConsentStatus,
  getConsentStatus,
  type CookieConsent 
} from '@/lib/cookies';
import { trackCookieConsent } from '@/lib/gtm-events';
import { Button } from '@/components/ui';

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
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const clear = () => root.style.setProperty(BANNER_HEIGHT_VAR, '0px');

    if (!showBanner) {
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
  }, [showBanner, showPreferences]);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = hasUserConsented();
    const currentConsent = getConsentStatus();
    
    if (!hasConsented) {
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
    trackCookieConsent({ action: 'accept_all', analytics: true, marketing: true, preferences: true });
  };

  const handleRejectAll = () => {
    rejectAllCookies();
    setShowBanner(false);
    trackCookieConsent({ action: 'reject_all', analytics: false, marketing: false, preferences: false });
  };

  const handleSavePreferences = () => {
    setConsentStatus({
      analytics: consent?.analytics || false,
      marketing: consent?.marketing || false,
      preferences: consent?.preferences || false
    });
    setShowBanner(false);
    setShowPreferences(false);
    trackCookieConsent({
      action: 'save_preferences',
      analytics: consent?.analytics || false,
      marketing: consent?.marketing || false,
      preferences: consent?.preferences || false
    });
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner - Mobile-optimized with collapsible design */}
      {/* z-[90] keeps the banner above the sticky CTA bar (z-[80]), which now sits directly
          on top of it rather than waiting for it to be dismissed. */}
      <div
        ref={bannerRef}
        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-line shadow-lg z-[90] animate-slide-up safe-area-inset-bottom"
      >
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-6 sm:py-3 lg:px-8">
          {/* Mobile: Compact single-line design */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-ink flex-1">
                We use cookies.{' '}
                <Link href="/privacy-policy" className="underline">
                  Read our privacy policy
                </Link>
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-2.5 min-h-[48px] min-w-[48px] flex items-center justify-center text-ink-muted hover:text-ink-strong"
                  aria-label="Cookie settings"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <Button
                  onClick={handleRejectAll}
                  variant="ghost"
                  size="sm"
                  className="min-h-[48px] text-xs"
                  aria-label="Reject all cookies"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  variant="primary"
                  size="sm"
                  className="min-h-[48px] text-xs"
                  aria-label="Accept all cookies"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
          
          {/* Desktop: Full design */}
          <div className="hidden sm:flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-ink">
              <p className="font-medium">We value your privacy</p>
              <p className="text-xs mt-1 text-ink-muted">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                <Link href="/privacy-policy" className="underline hover:text-accent-text">
                  Read our privacy policy
                </Link>
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Reject button - Equal prominence as per ICO guidelines */}
              <Button
                onClick={handleRejectAll}
                variant="outline"
                size="sm"
                aria-label="Reject all cookies"
              >
                Reject All
              </Button>
              
              {/* Preferences button */}
              <Button
                onClick={() => setShowPreferences(true)}
                variant="outline"
                size="sm"
                aria-label="Cookie preferences"
              >
                Preferences
              </Button>
              
              {/* Accept button - Equal prominence */}
              <Button
                onClick={handleAcceptAll}
                variant="primary"
                size="sm"
                aria-label="Accept all cookies"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/70 z-[90] flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-surface border border-line rounded-t-md sm:rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-slide-up sm:animate-none">
            <div className="sticky top-0 bg-surface border-b border-line p-4 sm:p-6 flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-ink-strong">Cookie Preferences</h2>
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
                  <p className="text-sm text-ink">
                    These cookies are essential for the website to function properly. They enable basic functions like page navigation and access to secure areas.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b border-line pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-text">Analytics Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.analytics || false}
                        onChange={(e) => setConsent(prev => ({ ...prev!, analytics: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-sunk border border-line peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-anchor-gold-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anchor-green peer-checked:border-anchor-green"></div>
                    </label>
                  </div>
                  <p className="text-sm text-ink">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border-b border-line pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-text">Marketing Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.marketing || false}
                        onChange={(e) => setConsent(prev => ({ ...prev!, marketing: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-sunk border border-line peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-anchor-gold-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anchor-green peer-checked:border-anchor-green"></div>
                    </label>
                  </div>
                  <p className="text-sm text-ink">
                    These cookies are used to deliver advertisements more relevant to you and your interests. They remember that you have visited a website and this information is shared with advertisers.
                  </p>
                </div>

                {/* Preference Cookies */}
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-accent-text">Preference Cookies</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent?.preferences || false}
                        onChange={(e) => setConsent(prev => ({ ...prev!, preferences: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-surface-sunk border border-line peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-anchor-gold-dark rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-anchor-green peer-checked:border-anchor-green"></div>
                    </label>
                  </div>
                  <p className="text-sm text-ink">
                    These cookies enable the website to remember choices you make (such as your language preference) and provide enhanced, more personal features.
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
