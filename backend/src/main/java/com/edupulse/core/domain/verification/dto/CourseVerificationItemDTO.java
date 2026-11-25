package com.edupulse.core.domain.verification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseVerificationItemDTO {
    private String courseCode;
    private String courseName;
    private String examName;
    private BigDecimal marksObtained;
    private BigDecimal totalMarks;
    private String gradeLabel;
    private BigDecimal gradePoint;
    private String status;
}
