/**
 * Analytics stub. Every CTA calls `track(event, props)`.
 * Wire this to GA4 / PostHog / Segment by replacing the body.
 */
export type AnalyticsEvent =
  | "cta_click"
  | "nav_click"
  | "signup_start"
  | "trial_start"
  | "locale_change"
  | "theme_toggle"
  | "cookie_consent";

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line no-console
  console.debug(`[analytics] ${event}`, props);
  // Example real impl:
  // window.gtag?.("event", event, props);
  // window.posthog?.capture(event, props);
}
