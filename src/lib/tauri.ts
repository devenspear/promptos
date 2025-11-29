// Tauri detection and utilities

export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI_INTERNALS__' in window;
}

// Check if running in desktop mode
export function isDesktop(): boolean {
  return isTauri();
}
