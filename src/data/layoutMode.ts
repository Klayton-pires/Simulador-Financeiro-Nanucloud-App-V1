export type LayoutMode = 'friendly' | 'advanced';

const STORAGE_KEY = 'nanucloud_layout_mode';

export function getLayoutMode(): LayoutMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'friendly' || saved === 'advanced') {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to read layout mode:', e);
  }
  return 'friendly'; // Default to Friendly (Básico) for optimal ease of use
}

export function setLayoutMode(mode: LayoutMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
    window.dispatchEvent(new CustomEvent('nanucloud_layout_mode_changed', { detail: mode }));
  } catch (e) {
    console.error('Failed to set layout mode:', e);
  }
}
