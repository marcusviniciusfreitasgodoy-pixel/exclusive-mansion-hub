import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'otp_brute_force';
const LOCKOUT_THRESHOLD = 5;
const MAX_ATTEMPTS = 10;
const LOCKOUT_DURATION = 60; // seconds

interface StoredState {
  failedAttempts: number;
  lockedUntil: number | null; // timestamp
}

function getStoredState(): StoredState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { failedAttempts: 0, lockedUntil: null };
}

function saveState(state: StoredState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useOTPBruteForceProtection(onMaxAttempts?: () => void) {
  const [failedAttempts, setFailedAttempts] = useState(() => getStoredState().failedAttempts);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for existing lockout on mount
  useEffect(() => {
    const stored = getStoredState();
    setFailedAttempts(stored.failedAttempts);
    if (stored.lockedUntil) {
      const remaining = Math.ceil((stored.lockedUntil - Date.now()) / 1000);
      if (remaining > 0) {
        setRemainingSeconds(remaining);
      } else {
        saveState({ ...stored, lockedUntil: null });
      }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          const stored = getStoredState();
          saveState({ ...stored, lockedUntil: null });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [remainingSeconds > 0]);

  const registerFailedAttempt = useCallback(() => {
    const stored = getStoredState();
    const newCount = stored.failedAttempts + 1;

    if (newCount >= MAX_ATTEMPTS) {
      saveState({ failedAttempts: 0, lockedUntil: null });
      setFailedAttempts(0);
      onMaxAttempts?.();
      return;
    }

    if (newCount >= LOCKOUT_THRESHOLD) {
      const lockedUntil = Date.now() + LOCKOUT_DURATION * 1000;
      saveState({ failedAttempts: newCount, lockedUntil });
      setFailedAttempts(newCount);
      setRemainingSeconds(LOCKOUT_DURATION);
    } else {
      saveState({ failedAttempts: newCount, lockedUntil: null });
      setFailedAttempts(newCount);
    }
  }, [onMaxAttempts]);

  const reset = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFailedAttempts(0);
    setRemainingSeconds(0);
  }, []);

  const isLocked = remainingSeconds > 0;

  // Progressive delay in ms for attempts 1-4
  const getDelay = useCallback(() => {
    if (failedAttempts === 0 || failedAttempts >= LOCKOUT_THRESHOLD) return 0;
    return Math.pow(2, failedAttempts - 1) * 1000; // 1s, 2s, 4s, 8s
  }, [failedAttempts]);

  return { isLocked, remainingSeconds, failedAttempts, registerFailedAttempt, reset, getDelay };
}
