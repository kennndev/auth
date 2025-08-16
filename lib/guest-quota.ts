// "use client"
const KEY = "cardify.freeCreations.v1";
export const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_CREATIONS ?? 3);

/** Get how many creations the current guest has used (0..FREE_LIMIT). */
export function getGuestCount(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0; // non-blocking if storage unavailable
  }
}

export function setGuestCount(n: number) {
  try {
    localStorage.setItem(KEY, String(Math.min(Math.max(n, 0), FREE_LIMIT)));
    // fire a custom event so other components (e.g., nav) can update immediately
    window.dispatchEvent(new Event("cardify-free-updated"));
  } catch {}
}

export function incrementGuestCreation() {
  const used = getGuestCount();
  if (used < FREE_LIMIT) setGuestCount(used + 1);
}

export function getRemaining(): number {
  return Math.max(FREE_LIMIT - getGuestCount(), 0);
}

export function canCreateMore(): boolean {
  return getGuestCount() < FREE_LIMIT;
}

/** Optional helper if you want to reset for testing */
export function resetGuestQuota() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("cardify-free-updated"));
  } catch {}
}
