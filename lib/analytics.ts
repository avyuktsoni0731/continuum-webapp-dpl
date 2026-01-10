// Helper functions for tracking custom events

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "", {
      page_path: url,
    });
  }
};

// Track waitlist signups
export const trackWaitlistSignup = (email: string) => {
  trackEvent("waitlist_signup", {
    event_category: "engagement",
    event_label: "Waitlist Form",
    value: 1,
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  trackEvent("button_click", {
    event_category: "engagement",
    button_name: buttonName,
    location: location,
  });
};

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent("scroll_depth", {
    event_category: "engagement",
    scroll_depth: depth,
  });
};
