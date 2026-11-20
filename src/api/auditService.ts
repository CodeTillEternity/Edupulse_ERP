import axiosClient from './axiosClient';

export interface AuditRecord {
  id: number;
  actionType: string;
  entityType: string;
  entityId: string;
  actorUsername: string;
  actorRole: string;
  ipAddress: string;
  description: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  tenantId: string;
}

export const getAuditLogs = async (limit: number = 100): Promise<AuditRecord[]> => {
  const response = await axiosClient.get<AuditRecord[]>('/api/v1/audit/logs', {
    params: { limit }
  });
  return response.data;
};
