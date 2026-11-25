package com.edupulse.core.api.rest;

import com.edupulse.core.domain.audit.AuditLog;
import com.edupulse.core.domain.audit.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
@Tag(name = "System Audit Trail", description = "Immutable audit log tracking sensitive grade, financial, and enrollment modifications")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    @Operation(summary = "Get Recent Audit Logs", description = "Returns top 100 system audit records for internal compliance inspections")
    public ResponseEntity<List<AuditLog>> getAuditLogs(@RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(auditService.getRecentLogs(limit));
    }
}
