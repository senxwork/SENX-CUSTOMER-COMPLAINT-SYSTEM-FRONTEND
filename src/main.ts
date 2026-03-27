/// <reference types="@angular/localize" />

// ✅ --- FIX for Android LINE LIFF "TypeError: Failed to fetch" ---
const originalFetch = window.fetch;
window.fetch = function (url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
  const urlStr = url.toString();
  if (
    urlStr.startsWith("https://liffsdk.line-scdn.net/xlt/") &&
    urlStr.endsWith(".json")
  ) {
    url = urlStr + "?ts=" + Math.random();
  }
  return originalFetch(url, options);
};
// ✅ --- END FIX ---

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .catch(err => console.error("❌ Angular bootstrap failed:", err));
