/** Smooth client-side navigation helper */
export const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  const navEvent = new Event('navigate');
  window.dispatchEvent(navEvent);
};
