package com.edupulse.core.domain.communication.service;

import com.edupulse.core.domain.communication.dto.AbsenceAlertRequestDTO;
import com.edupulse.core.domain.communication.dto.CommunicationResponseDTO;
import com.edupulse.core.domain.communication.dto.FeeNoticeRequestDTO;
import com.edupulse.core.domain.communication.dto.HallTicketDispatchRequestDTO;

import java.util.List;
import java.util.Map;

public interface CommunicationService {
    List<CommunicationResponseDTO> dispatchAbsenceAlerts(AbsenceAlertRequestDTO request);
    CommunicationResponseDTO dispatchFeeNotice(FeeNoticeRequestDTO request);
    CommunicationResponseDTO dispatchFeeReceipt(String invoiceNumber);
    List<CommunicationResponseDTO> dispatchHallTickets(HallTicketDispatchRequestDTO request);
    List<CommunicationResponseDTO> getOutboxLogs(int limit);
    Map<String, String> getGatewayStatus();
}
