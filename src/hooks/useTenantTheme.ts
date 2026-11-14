import { useInstitutionStore } from '../store/useInstitutionStore';

export interface TenantBranding {
  tenantId?: string;
  institutionName: string;
  customSubdomain?: string;
  logoUrl: string | null;
  faviconUrl?: string | null;
  primaryColorHex?: string | null;
  secondaryColorHex?: string | null;
}

export function useTenantTheme() {
  const { institution } = useInstitutionStore();

  const branding: TenantBranding = {
    tenantId: 'default',
    institutionName: institution.name || 'EduPulse Institutional ERP',
    customSubdomain: 'desktop',
    logoUrl: institution.logoUrl || null,
    faviconUrl: null,
    primaryColorHex: institution.brandPrimary || '#4f46e5',
    secondaryColorHex: institution.brandSecondary || '#64748b',
  };

  return {
    subdomain: 'desktop',
    branding,
    loading: false,
    error: null,
  };
}

export default useTenantTheme;
