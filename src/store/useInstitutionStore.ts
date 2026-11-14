import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface InstitutionProfileData {
  name: string;
  code: string;
  campus: string;
  tagline: string;
  logoUrl: string | null;
  website: string;
  email: string;
  phone: string;
  address: string;
}

export const DEFAULT_INSTITUTION_PROFILE: InstitutionProfileData = {
  name: 'Central University System',
  code: 'CUS-01',
  campus: 'Main Campus • Institutional Node 01',
  tagline: 'Unified Institutional Management Platform',
  logoUrl: null,
  website: 'https://university.edu',
  email: 'admin@centraluniversity.edu',
  phone: '+1 (555) 234-5678',
  address: '100 University Boulevard, Academic Quad, Building A',
};

interface InstitutionState {
  institution: InstitutionProfileData;
  updateInstitution: (data: Partial<InstitutionProfileData>) => void;
  resetToDefault: () => void;
}

export const useInstitutionStore = create<InstitutionState>()(
  persist(
    (set) => ({
      institution: DEFAULT_INSTITUTION_PROFILE,
      updateInstitution: (data) =>
        set((state) => ({
          institution: { ...state.institution, ...data },
        })),
      resetToDefault: () =>
        set({
          institution: DEFAULT_INSTITUTION_PROFILE,
        }),
    }),
    {
      name: 'edupulse_institution_profile',
    }
  )
);
