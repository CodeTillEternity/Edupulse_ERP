import { axiosClient, resolveBaseUrl } from '../api/axiosClient';

export const BASE_URL = resolveBaseUrl();

export const getStudentPhotoUrl = (studentId: number | string | undefined | null, timestamp?: number) => {
  if (!studentId) return '';
  const base = BASE_URL ? BASE_URL.replace(/\/$/, '') : '';
  const ts = timestamp ? `?t=${timestamp}` : '';
  return `${base}/api/v1/students/${studentId}/photo${ts}`;
};

/**
 * apiClient is the centralized API client used across all ERP modules.
 * Routed through axiosClient to ensure DPAPI vaulting, refresh serialization,
 * and correlation ID injection in desktop mode while preserving pure web compatibility (P4.2).
 */
export const apiClient = axiosClient;
export default apiClient;
