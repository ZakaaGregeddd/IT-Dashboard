let isDirtyCheck: (() => boolean) | null = null;

export const setIsDirtyCheck = (callback: (() => boolean) | null) => {
  isDirtyCheck = callback;
};

export const checkIsDirty = (): boolean => {
  return isDirtyCheck ? isDirtyCheck() : false;
};

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
