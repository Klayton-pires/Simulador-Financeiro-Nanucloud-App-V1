import { useState, useEffect } from 'react';

export const DEFAULT_GUEST_FREE_CREDITS = 5;
const STORAGE_KEY = 'nanucloud_guest_credits';
const STORAGE_DATE_KEY = 'nanucloud_guest_credits_date';

/**
 * Get current guest free credits from localStorage.
 * Automatically restores credits on the next day (daily reset at midnight).
 * Initializes to DEFAULT_GUEST_FREE_CREDITS if not yet set.
 */
export function getGuestCredits(): number {
  if (typeof window === 'undefined') return DEFAULT_GUEST_FREE_CREDITS;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(STORAGE_DATE_KEY);

    // As consultas grátis restauram no dia seguinte automaticamente!
    if (savedDate !== today) {
      localStorage.setItem(STORAGE_KEY, String(DEFAULT_GUEST_FREE_CREDITS));
      localStorage.setItem(STORAGE_DATE_KEY, today);
      return DEFAULT_GUEST_FREE_CREDITS;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      localStorage.setItem(STORAGE_KEY, String(DEFAULT_GUEST_FREE_CREDITS));
      localStorage.setItem(STORAGE_DATE_KEY, today);
      return DEFAULT_GUEST_FREE_CREDITS;
    }
    const val = parseInt(saved, 10);
    return isNaN(val) ? DEFAULT_GUEST_FREE_CREDITS : Math.max(0, val);
  } catch {
    return DEFAULT_GUEST_FREE_CREDITS;
  }
}

/**
 * Decrement guest credit by 1 (minimum 0).
 * Dispatches an event so all components react immediately.
 */
export function useGuestCredit(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const current = getGuestCredits();
    const next = Math.max(0, current - 1);
    localStorage.setItem(STORAGE_KEY, String(next));
    localStorage.setItem(STORAGE_DATE_KEY, today);
    window.dispatchEvent(new CustomEvent('nanucloud_credits_updated', { detail: { credits: next } }));
    return next;
  } catch {
    return 0;
  }
}

/**
 * Alias for useGuestCredit
 */
export const consumeGuestCredit = useGuestCredit;

/**
 * Check if the guest has at least 1 free credit remaining.
 */
export function hasGuestCredits(): boolean {
  return getGuestCredits() > 0;
}

/**
 * Reset or set guest free credits (for testing or promo).
 */
export function setGuestCredits(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, count)));
    window.dispatchEvent(new CustomEvent('nanucloud_credits_updated', { detail: { credits: count } }));
  } catch {}
}

/**
 * React hook to reactively listen to guest credit changes.
 */
export function useGuestCredits(): number {
  const [credits, setCredits] = useState<number>(() => getGuestCredits());

  useEffect(() => {
    const handleUpdate = () => {
      setCredits(getGuestCredits());
    };

    window.addEventListener('nanucloud_credits_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('nanucloud_credits_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return credits;
}
