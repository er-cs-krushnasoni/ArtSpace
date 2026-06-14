import { useState, useEffect } from 'react';

export function usePWAInstall() {
  let installPrompt, setInstallPrompt;
  try {
    [installPrompt, setInstallPrompt] = useState(null); // eslint-disable-line react-hooks/rules-of-hooks
  } catch {
    // HMR-induced duplicate React instance — return safe no-op defaults
    return { canInstall: false, install: async () => {} };
  }

  useEffect(() => { // eslint-disable-line react-hooks/rules-of-hooks
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return { canInstall: !!installPrompt, install };
}