package com.edupulse.core.domain.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifiedCredentialDTO {
    private String verificationToken;
    private boolean valid;
    private String statusMessage;
    private String documentType;
    private String studentName;
    private String enrollmentNumber;
    private String institutionName;
    private String departmentName;
    private String programDegree;
    private String batchName;
    private BigDecimal cumulativeGpa;
    private String division;
    private int totalEvaluations;
    private String issueDate;
    private String issuingAuthority;
    private String digitalSignatureSha256;
    private String verificationUrl;
    private String securityAssurance;
    private List<CourseVerificationItemDTO> courseRecords;
    private Map<String, String> institutionalAttributes;
}
