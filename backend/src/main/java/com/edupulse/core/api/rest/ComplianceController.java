package com.edupulse.core.api.rest;

import com.edupulse.core.domain.compliance.dto.NaacMetricsDTO;
import com.edupulse.core.domain.compliance.dto.NirfSummaryDTO;
import com.edupulse.core.domain.compliance.service.ComplianceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/compliance")
@RequiredArgsConstructor
@Tag(name = "Regulatory Compliance & Audits", description = "Automated metrics for NAAC, NIRF, and AICTE institutional accreditation")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN')")
public class ComplianceController {

    private final ComplianceService complianceService;

    @GetMapping("/naac")
    @Operation(summary = "Get NAAC Metrics", description = "Calculates Student-Faculty Ratio (SFR), Cadre Ratio, and Reservation breakdowns for NAAC SSR")
    public ResponseEntity<NaacMetricsDTO> getNaacMetrics() {
        return ResponseEntity.ok(complianceService.calculateNaacMetrics());
    }

    @GetMapping("/nirf")
    @Operation(summary = "Get NIRF Summary", description = "Aggregates TLR, GO, and OI parameters for NIRF ranking assessment")
    public ResponseEntity<NirfSummaryDTO> getNirfSummary() {
        return ResponseEntity.ok(complianceService.calculateNirfSummary());
    }
}
