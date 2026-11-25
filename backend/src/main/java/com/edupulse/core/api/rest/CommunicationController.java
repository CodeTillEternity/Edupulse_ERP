package com.edupulse.core.api.rest;

import com.edupulse.core.domain.communication.dto.AbsenceAlertRequestDTO;
import com.edupulse.core.domain.communication.dto.CommunicationResponseDTO;
import com.edupulse.core.domain.communication.dto.FeeNoticeRequestDTO;
import com.edupulse.core.domain.communication.dto.HallTicketDispatchRequestDTO;
import com.edupulse.core.domain.communication.service.CommunicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("coreCommunicationController")
@RequestMapping("/api/v1/communication")
@Tag(name = "Communication & Notification Rails", description = "WhatsApp Business & SMS triggers for absence, fee notices, and exam admit cards")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'FINANCE', 'FACULTY', 'STUDENT')")
public class CommunicationController {

    private final CommunicationService communicationService;

    public CommunicationController(@Qualifier("coreCommunicationService") CommunicationService communicationService) {
        this.communicationService = communicationService;
    }

    @GetMapping("/status")
    @Operation(summary = "Get Communication Gateway Status", description = "Checks whether Meta WhatsApp Cloud API or Interactive Simulator mode is active")
    public ResponseEntity<Map<String, String>> getStatus() {
        return ResponseEntity.ok(communicationService.getGatewayStatus());
    }

    @GetMapping("/outbox")
    @Operation(summary = "Get Outbox Logs", description = "Retrieves recent sent WhatsApp & SMS communication records")
    public ResponseEntity<List<CommunicationResponseDTO>> getOutbox(@RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(communicationService.getOutboxLogs(limit));
    }

    @PostMapping("/triggers/absence")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'FACULTY')")
    @Operation(summary = "Trigger Attendance Absence Alerts", description = "Dispatches WhatsApp notification to parents of absent students")
    public ResponseEntity<List<CommunicationResponseDTO>> triggerAbsenceAlerts(
            @Valid @RequestBody AbsenceAlertRequestDTO request) {
        List<CommunicationResponseDTO> responses = communicationService.dispatchAbsenceAlerts(request);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/triggers/fee-notice")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'FINANCE')")
    @Operation(summary = "Trigger Fee Dues Notice", description = "Dispatches WhatsApp fee dues reminder with direct payment link")
    public ResponseEntity<CommunicationResponseDTO> triggerFeeNotice(
            @Valid @RequestBody FeeNoticeRequestDTO request) {
        CommunicationResponseDTO response = communicationService.dispatchFeeNotice(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/triggers/fee-receipt")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'FINANCE', 'STUDENT')")
    @Operation(summary = "Trigger Fee Clearance Receipt", description = "Dispatches verified fee payment receipt on settlement")
    public ResponseEntity<CommunicationResponseDTO> triggerFeeReceipt(
            @RequestParam String invoiceNumber) {
        CommunicationResponseDTO response = communicationService.dispatchFeeReceipt(invoiceNumber);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/triggers/hall-tickets")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN', 'FACULTY')")
    @Operation(summary = "Bulk Dispatch Exam Hall Tickets", description = "1-click bulk dispatch of exam admit cards to cohort students and parents")
    public ResponseEntity<List<CommunicationResponseDTO>> triggerHallTickets(
            @Valid @RequestBody HallTicketDispatchRequestDTO request) {
        List<CommunicationResponseDTO> responses = communicationService.dispatchHallTickets(request);
        return ResponseEntity.ok(responses);
    }
}
