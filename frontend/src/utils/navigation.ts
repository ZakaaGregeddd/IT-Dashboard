let isDirtyCheck: (() => boolean) | null = null;
let isGlobalDirty = false;

export const setIsDirtyCheck = (callback: (() => boolean) | null) => {
  isDirtyCheck = callback;
};

export const setGlobalDirty = (dirty: boolean) => {
  isGlobalDirty = dirty;
};

export const checkIsDirty = (): boolean => {
  if (isDirtyCheck) {
    return isDirtyCheck();
  }
  return isGlobalDirty;
};

// Global Event Listeners to automatically track unsaved changes on ALL pages
if (typeof window !== 'undefined') {
  // 1. Mark as dirty when user types/inputs data
  window.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
      // Check if this is a main Month/Year filter dropdown to avoid false positives
      const labelText = target.previousElementSibling?.textContent?.toLowerCase() || '';
      const isMainFilter = 
        labelText.includes('bulan') || 
        labelText.includes('tahun') || 
        labelText.includes('dari tahun') || 
        labelText.includes('sampai tahun');

      if (!isMainFilter) {
        isGlobalDirty = true;
      }
    }
  });

  // 2. Reset dirty flag when user clicks Save, Batal, Konfirmasi, or Cancel buttons
  window.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const clickable = target.closest('button, input[type="submit"], a');
    if (clickable) {
      const text = clickable.textContent?.toLowerCase() || '';
      const value = (clickable as HTMLInputElement).value?.toLowerCase() || '';
      
      const isSaveOrReset = 
        text.includes('simpan') || 
        text.includes('save') || 
        text.includes('batal') || 
        text.includes('cancel') || 
        text.includes('konfirmasi') || 
        text.includes('confirm') ||
        value.includes('simpan') || 
        value.includes('save') || 
        value.includes('batal') ||
        value.includes('cancel');
      
      if (isSaveOrReset) {
        isGlobalDirty = false;
      }
    }
  });
}

/** Smooth client-side navigation helper */
export const navigateTo = (path: string) => {
  if (checkIsDirty()) {
    const event = new CustomEvent('show-unsaved-warning', { detail: { path } });
    window.dispatchEvent(event);
    return;
  }
  window.history.pushState({}, '', path);
  const navEvent = new Event('navigate');
  window.dispatchEvent(navEvent);
};
