import { useState, useEffect } from 'react';

/**
 * Captures the browser's beforeinstallprompt event so we can
 * trigger the install dialog from our own button.
 */
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
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