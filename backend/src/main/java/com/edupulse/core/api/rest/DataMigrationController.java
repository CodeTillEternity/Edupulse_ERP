package com.edupulse.core.api.rest;

import com.edupulse.core.domain.migration.dto.*;
import com.edupulse.core.domain.migration.service.DataMigrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/migration")
@RequiredArgsConstructor
@Tag(name = "Data Migration & Onboarding", description = "High-throughput bulk CSV ingestion for legacy institutional data")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'SUPER_ADMIN', 'ADMIN')")
public class DataMigrationController {

    private final DataMigrationService migrationService;

    @PostMapping(value = "/students/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Validate Student CSV", description = "Pre-flight validation of bulk student rows against institutional schemas and duplicates")
    public ResponseEntity<ImportValidationResultDTO<StudentImportRowDTO>> validateStudents(
            @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ImportValidationResultDTO.<StudentImportRowDTO>builder()
                            .importType("STUDENTS")
                            .globalErrors(List.of("Uploaded file is empty."))
                            .build()
            );
        }
        ImportValidationResultDTO<StudentImportRowDTO> result = migrationService.validateStudentsCsv(file.getInputStream());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/students/commit")
    @Operation(summary = "Commit Student Records", description = "Atomically persists validated student batch into multi-tenant database")
    public ResponseEntity<ImportExecutionResponseDTO> commitStudents(
            @RequestBody List<StudentImportRowDTO> rows) {
        ImportExecutionResponseDTO response = migrationService.commitStudents(rows);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(value = "/invoices/validate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Validate Invoices CSV", description = "Validates historical fee invoices, checking student enrollment IDs and fee structures")
    public ResponseEntity<ImportValidationResultDTO<FeeInvoiceImportRowDTO>> validateInvoices(
            @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    ImportValidationResultDTO.<FeeInvoiceImportRowDTO>builder()
                            .importType("FEE_INVOICES")
                            .globalErrors(List.of("Uploaded file is empty."))
                            .build()
            );
        }
        ImportValidationResultDTO<FeeInvoiceImportRowDTO> result = migrationService.validateInvoicesCsv(file.getInputStream());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/invoices/commit")
    @Operation(summary = "Commit Invoices", description = "Atomically persists validated historical fee invoices")
    public ResponseEntity<ImportExecutionResponseDTO> commitInvoices(
            @RequestBody List<FeeInvoiceImportRowDTO> rows) {
        ImportExecutionResponseDTO response = migrationService.commitInvoices(rows);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(value = "/templates/{type}", produces = "text/csv")
    @Operation(summary = "Download Sample CSV Template", description = "Generates pre-formatted CSV template file for students or fees")
    public ResponseEntity<String> downloadTemplate(@PathVariable String type) {
        String csv = migrationService.getSampleTemplateCsv(type);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", type + "_template.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
}
