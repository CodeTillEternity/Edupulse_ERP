package com.edupulse.core.domain.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeInvoiceImportRowDTO {
    private int rowNumber;
    private String invoiceNumber;
    private String enrollmentNumber;
    private String feeStructureName;
    private BigDecimal grossAmount;
    private BigDecimal discount;
    private BigDecimal amountPaid;
    private LocalDate dueDate;
    private String status;
    private boolean valid;
    private String validationError;
}
