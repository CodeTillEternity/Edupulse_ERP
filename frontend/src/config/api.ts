import { axiosClient, resolveBaseUrl } from '../api/axiosClient';

export const BASE_URL = resolveBaseUrl();

export const getStudentPhotoUrl = (studentId: number | string | undefined | null, timestamp?: number) => {
  if (!studentId) return '';
  const base = resolveBaseUrl();
  const ts = timestamp ? `?t=${timestamp}` : '';
  return `${base}/api/v1/students/${studentId}/photo${ts}`;
};

/**
 * apiClient is the centralized API client used across all ERP modules.
 * Supports both Web SaaS (VITE_API_BASE_URL) and Desktop Tauri mode (DPAPI + local sidecar).
 */
export const apiClient = axiosClient;
export default apiClient;
