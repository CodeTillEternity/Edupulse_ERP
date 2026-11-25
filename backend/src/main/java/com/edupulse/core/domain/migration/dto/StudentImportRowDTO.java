package com.edupulse.core.domain.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentImportRowDTO {
    private int rowNumber;
    private String enrollmentNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String departmentCode;
    private String batchName;
    private String phone;
    private String category; // GENERAL, SC, ST, OBC, EWS
    private String gender;   // MALE, FEMALE, OTHER
    private String status;   // ACTIVE, INACTIVE
    private boolean valid;
    private String validationError;
}
