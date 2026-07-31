export const CONSENT_STORAGE_KEY = "consent-ack";

export function hasConsent(): boolean {
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) === "1";
}

export function setConsent(): void {
  window.localStorage.setItem(CONSENT_STORAGE_KEY, "1");
}

export function clearConsent(): void {
  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
}
