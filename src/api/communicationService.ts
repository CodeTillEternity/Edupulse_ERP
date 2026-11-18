import apiClient from './axiosClient';

export type CommunicationChannel = 'WHATSAPP' | 'SMS';
export type TriggerType = 'ABSENCE_ALERT' | 'FEE_DUE_NOTICE' | 'FEE_PAYMENT_RECEIPT' | 'EXAM_HALL_TICKET';
export type DeliveryStatus = 'DELIVERED' | 'SIMULATED' | 'FAILED';

export interface CommunicationLog {
  id: number;
  channel: CommunicationChannel;
  triggerType: TriggerType;
  recipientPhone: string;
  recipientName?: string;
  studentEnrollment?: string;
  studentName?: string;
  subject?: string;
  messageContent: string;
  deliveryStatus: DeliveryStatus;
  gatewayReferenceId?: string;
  directChatLink?: string;
  sentAt: string;
}

export interface AbsenceAlertRequest {
  timetableEntryId?: number;
  date: string;
  absentStudentIds: number[];
  courseName?: string;
  roomNumber?: string;
  timeSlot?: string;
  autoDispatch?: boolean;
}

export interface FeeNoticeRequest {
  invoiceNumber: string;
  studentEnrollment?: string;
  studentName?: string;
  title?: string;
  amount?: number;
  dueDate?: string;
  recipientPhone?: string;
  channel?: CommunicationChannel;
}

export interface HallTicketDispatchRequest {
  examId?: number;
  batchId?: number;
  examTitle?: string;
  examDate?: string;
  hallLocation?: string;
  channel?: CommunicationChannel;
}

export interface GatewayStatus {
  mode: 'LIVE_META_CLOUD' | 'INTERACTIVE_SIMULATOR';
  provider: string;
  whatsappStatus: string;
  smsStatus: string;
  phoneNumberId?: string;
  activeChannels: string[];
}

export const communicationService = {
  /**
   * Check gateway connectivity and dispatch mode (Meta WhatsApp Cloud API vs Interactive Simulator)
   */
  async getGatewayStatus(): Promise<GatewayStatus> {
    try {
      const response = await apiClient.get<GatewayStatus>('/api/v1/communication/status');
      return response.data;
    } catch {
      return {
        mode: 'INTERACTIVE_SIMULATOR',
        provider: 'EduPulse In-App Communication Sandbox',
        whatsappStatus: 'SIMULATED',
        smsStatus: 'SIMULATED',
        activeChannels: ['WHATSAPP', 'SMS']
      };
    }
  },

  /**
   * Retrieve recent WhatsApp & SMS outbox dispatch logs
   */
  async getOutboxLogs(limit: number = 50): Promise<CommunicationLog[]> {
    try {
      const response = await apiClient.get<CommunicationLog[]>('/api/v1/communication/outbox', {
        params: { limit }
      });
      return response.data;
    } catch {
      // Fallback baseline logs for offline/demo operation
      return [
        {
          id: 1,
          channel: 'WHATSAPP',
          triggerType: 'ABSENCE_ALERT',
          recipientPhone: '+919829012345',
          recipientName: 'Rajesh Sharma (Guardian)',
          studentEnrollment: '23CSM001',
          studentName: 'Aarav Sharma',
          subject: 'Morning Attendance Absence Alert - CS301',
          messageContent:
            '🔔 *Arya College of Engineering & IT — Daily Attendance Alert*\n\nDear Parent/Guardian of *Aarav Sharma* (Roll: *23CSM001*),\n\nYour ward was marked *ABSENT* for *CS301 (Advanced Distributed Systems)* during morning session on *Nov 18, 2026*.\n\nInstitutional Policy requires 75% minimum attendance for semester examination eligibility.',
          deliveryStatus: 'SIMULATED',
          gatewayReferenceId: 'SIM_WA_ABS_23CSM001',
          directChatLink:
            'https://wa.me/919829012345?text=%F0%9F%94%94%20*Arya%20College%20of%20Engineering%20%26%20IT%20%E2%80%94%20Daily%20Attendance%20Alert*',
          sentAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 2,
          channel: 'WHATSAPP',
          triggerType: 'FEE_DUE_NOTICE',
          recipientPhone: '+919829012345',
          recipientName: 'Rajesh Sharma (Guardian)',
          studentEnrollment: '23CSM001',
          studentName: 'Aarav Sharma',
          subject: 'Fee Notice: INV-2026-LAB-0192 (₹15,000.00 Outstanding)',
          messageContent:
            '💳 *Arya College of Engineering & IT — Tuition & Special Lab Dues Notice*\n\nDear Parent/Guardian of *Aarav Sharma* (Roll: *23CSM001*),\n\nInvoice: *INV-2026-LAB-0192*\nHead: Advanced Distributed Systems — Special Lab Fee\nOutstanding Amount: *₹15,000.00*\nDue Date: Dec 20, 2026',
          deliveryStatus: 'SIMULATED',
          gatewayReferenceId: 'SIM_WA_FEE_INV-2026-LAB-0192',
          directChatLink:
            'https://wa.me/919829012345?text=%F0%9F%92%B3%20*Arya%20College%20of%20Engineering%20%26%20IT%20%E2%80%94%20Fee%20Notice*',
          sentAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: 3,
          channel: 'WHATSAPP',
          triggerType: 'FEE_PAYMENT_RECEIPT',
          recipientPhone: '+919829012345',
          recipientName: 'Rajesh Sharma (Guardian)',
          studentEnrollment: '23CSM001',
          studentName: 'Aarav Sharma',
          subject: 'Payment Receipt: INV-2026-HOSTEL-0044 (₹45,000.00 Cleared)',
          messageContent:
            '✅ *Arya College of Engineering & IT — Official Fee Settlement Clearance*\n\nDear Parent/Guardian of *Aarav Sharma*,\n\nWe acknowledge receipt of *₹45,000.00* settled via Razorpay/Bank Clearance.\nInvoice: *INV-2026-HOSTEL-0044*\nTransaction Ref: *PAY_SETTLED_H982134*\nStatus: CLEARED & RECONCILED.',
          deliveryStatus: 'SIMULATED',
          gatewayReferenceId: 'SIM_WA_RCP_INV-2026-HOSTEL-0044',
          directChatLink:
            'https://wa.me/919829012345?text=%E2%9C%85%20*Arya%20College%20of%20Engineering%20%26%20IT%20%E2%80%94%20Payment%20Receipt*',
          sentAt: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ];
    }
  },

  /**
   * Dispatch immediate absence alerts to parents of students marked absent
   */
  async dispatchAbsenceAlerts(payload: AbsenceAlertRequest): Promise<CommunicationLog[]> {
    const response = await apiClient.post<CommunicationLog[]>('/api/v1/communication/triggers/absence', payload);
    return response.data;
  },

  /**
   * Dispatch payment link and reminder notice to student or parent
   */
  async dispatchFeeNotice(payload: FeeNoticeRequest): Promise<CommunicationLog> {
    const response = await apiClient.post<CommunicationLog>('/api/v1/communication/triggers/fee-notice', payload);
    return response.data;
  },

  /**
   * Dispatch verified payment receipt on fee clearance
   */
  async dispatchFeeReceipt(invoiceNumber: string): Promise<CommunicationLog> {
    const response = await apiClient.post<CommunicationLog>('/api/v1/communication/triggers/fee-receipt', null, {
      params: { invoiceNumber }
    });
    return response.data;
  },

  /**
   * 1-click bulk dispatch of generated exam hall tickets / admit cards
   */
  async dispatchHallTickets(payload: HallTicketDispatchRequest): Promise<CommunicationLog[]> {
    const response = await apiClient.post<CommunicationLog[]>('/api/v1/communication/triggers/hall-tickets', payload);
    return response.data;
  }
};

export default communicationService;
