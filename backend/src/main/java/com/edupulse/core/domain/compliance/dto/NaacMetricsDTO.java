package com.edupulse.core.domain.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NaacMetricsDTO {
    // Criterion 2: Teaching-Learning and Evaluation
    private double studentFacultyRatio;
    private String sfrFormatted; // e.g. "14.2:1"
    private int totalEnrolledStudents;
    private int totalFullTimeFaculty;
    
    @Builder.Default
    private Map<String, Integer> facultyCadreRatio = new HashMap<>(); // Professors, Assoc Prof, Asst Prof
    
    @Builder.Default
    private Map<String, Integer> categoryReservationBreakdown = new HashMap<>(); // GENERAL, SC, ST, OBC, EWS
    
    private double femaleStudentPercentage;
    private double maleStudentPercentage;
    
    @Builder.Default
    private List<DepartmentPassRateDTO> departmentPassRates = new ArrayList<>();
    
    // Criterion 4: Infrastructure and Learning Resources
    private int totalLibraryBookTitles;
    private int totalLibraryActiveCirculation;
    
    // Financial Health (Criterion 6: Governance, Leadership and Management)
    private BigDecimal totalTuitionBilled;
    private BigDecimal totalTuitionCollected;
    private double feeCollectionEfficiencyPercentage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentPassRateDTO {
        private String departmentCode;
        private String departmentName;
        private int totalAppeared;
        private int totalPassed;
        private double passPercentage;
    }
}
