import { useSyncExternalStore } from 'react';

export interface AdminToastState {
  id: number;
  message: string;
}

let current: AdminToastState | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Fire-and-forget toast, callable from anywhere (handlers, hooks, other
 * components) without needing a context provider. Mirrors admin.html's
 * single `#adminToast` element: a new call replaces whatever is showing.
 */
export function showToast(message: string, duration = 2500) {
  if (hideTimer) clearTimeout(hideTimer);
  current = { id: Date.now() + Math.random(), message };
  emit();
  hideTimer = setTimeout(() => {
    current = null;
    emit();
  }, duration);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return current;
}

export function useAdminToast(): AdminToastState | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}
