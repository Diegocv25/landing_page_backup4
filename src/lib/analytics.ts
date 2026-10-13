export const GA_MEASUREMENT_ID = "G-2SSKZL5N1M";
export const META_PIXEL_ID = "1128814962933802";

export function initializeMetaPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (document.querySelector("script[data-meta-pixel]")) return;
  const script = document.createElement("script");
  script.dataset.metaPixel = META_PIXEL_ID;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.async = true;
  document.head.appendChild(script);
  window.setTimeout(() => {
    const fbq = (window as typeof window & { fbq?: (...args: unknown[]) => void }).fbq;
    if (fbq) {
      fbq("init", META_PIXEL_ID);
      fbq("track", "PageView");
    }
  }, 0);
}
export const CANONICAL_ORIGIN = "https://page.ias-nexus-automacao.com.br";

const ATTRIBUTION_STORAGE_KEY = "nexus_gestao_first_touch";
const BLOCKED_PARAM_KEYS = new Set([
  "email",
  "telefone",
  "phone",
  "nome",
  "name",
  "cpf",
  "cnpj",
  "tax_id",
  "taxid",
  "endereco",
  "address",
]);

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  captured_at?: string;
};

declare global {
  interface Window {
    dataLayer: Array<Record<number, unknown> & { length?: number }>;
    gtag: (...args: unknown[]) => void;
  }
}

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = `${ATTRIBUTION_STORAGE_KEY}_probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function cleanParams(params: AnalyticsParams): AnalyticsParams {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([key, value]) =>
        value !== undefined && !BLOCKED_PARAM_KEYS.has(key.toLowerCase()),
    ),
  );
}

export function initializeAnalytics() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer.push(args as unknown as Record<number, unknown>);
  };

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.dataset.gaMeasurementId = GA_MEASUREMENT_ID;
    document.head.appendChild(script);
  }

  const configuredKey = `gaConfigured${GA_MEASUREMENT_ID.replace(/[^A-Za-z0-9]/g, "")}`;
  if (!document.documentElement.dataset[configuredKey]) {
    document.documentElement.dataset[configuredKey] = "true";
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  }
}

export function storeAttributionFromUrl(
  url = window.location.href,
  referrer = document.referrer,
): Attribution {
  const storage = getStorage();
  const existing = getStoredAttribution();
  if (existing && Object.keys(existing).length > 0) return existing;

  const parsed = new URL(url, CANONICAL_ORIGIN);
  const keys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
  ] as const;

  const attribution: Attribution = {
    landing_page: `${parsed.pathname}${parsed.search}`,
    captured_at: new Date().toISOString(),
  };

  for (const key of keys) {
    const value = parsed.searchParams.get(key)?.trim();
    if (value) attribution[key] = value.slice(0, 500);
  }
  if (referrer) attribution.referrer = referrer.slice(0, 1000);

  storage?.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
}

export function getStoredAttribution(): Attribution | null {
  const value = getStorage()?.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as Attribution;
  } catch {
    getStorage()?.removeItem(ATTRIBUTION_STORAGE_KEY);
    return null;
  }
}

export function trackEvent(name: string, params: AnalyticsParams = {}) {
  initializeAnalytics();
  window.gtag?.("event", name, cleanParams(params));
}

export function buildPageViewParams(pathname: string, search: string) {
  const pagePath = `${pathname}${search}`;
  return {
    page_location: `${CANONICAL_ORIGIN}${pagePath}`,
    page_path: pagePath,
    page_title: document.title,
  };
}

export function trackPageView(pathname: string, search: string) {
  trackEvent("page_view", buildPageViewParams(pathname, search));
}
