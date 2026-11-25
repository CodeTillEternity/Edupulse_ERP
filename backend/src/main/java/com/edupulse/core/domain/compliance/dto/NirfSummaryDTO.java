package com.edupulse.core.domain.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NirfSummaryDTO {
    // Parameter 1: Teaching, Learning & Resources (TLR - 100 marks)
    private double tlrScore;
    private double facultyStudentRatioScore;
    private double facultyCadreProportionScore;

    // Parameter 2: Graduation Outcome (GO - 100 marks)
    private double goScore;
    private double universityExaminationMetric;
    private double medianGraduationEfficiency;

    // Parameter 3: Outreach & Inclusivity (OI - 100 marks)
    private double oiScore;
    private double percentageWomenStudents;
    private double economicallyDisadvantagedStudentsPercentage;

    // Parameter 4: Peer Perception & Benchmark (PR - 100 marks)
    private double overallProjectedScore;

    @Builder.Default
    private Map<String, String> parameterHighlights = new HashMap<>();
}
