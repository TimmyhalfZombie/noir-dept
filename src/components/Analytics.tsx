import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = (import.meta.env.VITE_GA_ID as string | undefined)?.trim() ?? '';

let gaInitialized = false;

function initGoogleAnalytics(gaId: string) {
  if (gaInitialized || typeof document === 'undefined') return;
  gaInitialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', gaId, { send_page_view: false });
}

/**
 * Optional GA4 integration.
 * Loads nothing unless VITE_GA_ID is set in the environment.
 */
export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID) return;
    initGoogleAnalytics(GA_ID);
    window.gtag?.('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
