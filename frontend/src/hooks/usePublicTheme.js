import { useTenant } from '../context/TenantContext';

export default function usePublicTheme() {
  const { tenant } = useTenant();
  return tenant?.websiteConfig?.publicTheme === 'dark' ? 'public-theme-dark' : '';
}