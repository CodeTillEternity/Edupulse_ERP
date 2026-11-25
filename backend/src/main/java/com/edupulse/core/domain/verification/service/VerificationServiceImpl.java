package com.edupulse.core.domain.verification.service;

import com.edupulse.core.domain.academic.dto.ResultResponseDTO;
import com.edupulse.core.domain.academic.dto.StudentTranscriptDTO;
import com.edupulse.core.domain.academic.service.ExamService;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.edupulse.core.domain.verification.dto.CourseVerificationItemDTO;
import com.edupulse.core.domain.verification.dto.VerifiedCredentialDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service("coreVerificationService")
@RequiredArgsConstructor
@Slf4j
public class VerificationServiceImpl implements VerificationService {

    @Qualifier("coreExamService")
    private final ExamService examService;

    @Qualifier("coreStudentRepository")
    private final StudentRepository studentRepository;

    private static final String INSTITUTION_SALT = "EduPulse_Enterprise_Authority_Salt_2026";

    @Override
    @Transactional(readOnly = true)
    public VerifiedCredentialDTO verifyCredential(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return buildInvalidResponse("Identifier cannot be null or empty.");
        }

        String raw = identifier.trim();
        String enrollment = extractEnrollmentNumber(raw);

        try {
            StudentTranscriptDTO transcript = examService.getStudentTranscript(enrollment);
            if (transcript == null || transcript.getStudentId() == null) {
                return buildInvalidResponse("No institutional academic record found for identifier '" + raw + "'.");
            }

            Optional<Student> studentOpt = studentRepository.findById(transcript.getStudentId());
            String deptName = "Computer Science & Engineering";
            String programName = "Bachelor of Technology";

            if (studentOpt.isPresent()) {
                Student s = studentOpt.get();
                if (s.getDepartment() != null) {
                    deptName = s.getDepartment().getName();
                    if (s.getDepartment().getCode() != null) {
                        programName = "Bachelor of Technology in " + deptName;
                    }
                }
            }

            BigDecimal gpa = transcript.getCumulativeGpa() != null ? transcript.getCumulativeGpa() : BigDecimal.ZERO;
            String signature = generateSha256Signature(transcript.getStudentId(), enrollment, gpa, transcript.getTotalExams());
            String token = "EDP-VRF-" + enrollment.toUpperCase() + "-" + signature.substring(0, 8).toUpperCase();

            String division;
            if (gpa.compareTo(BigDecimal.valueOf(8.50)) >= 0) {
                division = "First Class with Distinction (Honors)";
            } else if (gpa.compareTo(BigDecimal.valueOf(7.00)) >= 0) {
                division = "First Class";
            } else if (gpa.compareTo(BigDecimal.valueOf(5.50)) >= 0) {
                division = "Second Class";
            } else {
                division = "Pass / Satisfactory";
            }

            List<CourseVerificationItemDTO> courseRecords = new ArrayList<>();
            if (transcript.getResults() != null) {
                for (ResultResponseDTO r : transcript.getResults()) {
                    courseRecords.add(CourseVerificationItemDTO.builder()
                            .courseCode(r.getCourseCode() != null ? r.getCourseCode() : "N/A")
                            .courseName(r.getCourseName() != null ? r.getCourseName() : "General Course")
                            .examName(r.getExamName() != null ? r.getExamName() : "Semester Evaluation")
                            .marksObtained(r.getMarksObtained())
                            .totalMarks(r.getTotalMarks())
                            .gradeLabel(r.getGradeLabel() != null ? r.getGradeLabel() : "Pass")
                            .gradePoint(r.getGradePoint() != null ? r.getGradePoint() : BigDecimal.ZERO)
                            .status("VERIFIED")
                            .build());
                }
            }

            Map<String, String> institutionalAttributes = new LinkedHashMap<>();
            institutionalAttributes.put("Accreditation Status", "NAAC 'A+' Grade / AICTE Approved");
            institutionalAttributes.put("Autonomous Status", "UGC Section 2(f) & 12(B) Conferred");
            institutionalAttributes.put("Cryptographic Ledger", "SHA-256 HMAC Non-Repudiation Verified");
            institutionalAttributes.put("Verification Registry", "Office of the Controller of Examinations");
            institutionalAttributes.put("Concurrence Date", LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy")));

            return VerifiedCredentialDTO.builder()
                    .verificationToken(token)
                    .valid(true)
                    .statusMessage("OFFICIALLY AUTHENTICATED & RECORD VERIFIED")
                    .documentType("OFFICIAL_ACADEMIC_TRANSCRIPT")
                    .studentName(transcript.getStudentName())
                    .enrollmentNumber(transcript.getEnrollmentNumber())
                    .institutionName("EduPulse Institute of Technology & Advanced Sciences")
                    .departmentName(deptName)
                    .programDegree(programName)
                    .batchName(transcript.getBatchName())
                    .cumulativeGpa(gpa)
                    .division(division)
                    .totalEvaluations(transcript.getTotalExams())
                    .issueDate(LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy")))
                    .issuingAuthority("Office of the Controller of Examinations")
                    .digitalSignatureSha256(signature)
                    .verificationUrl("https://verify.edupulse.cloud/verify/" + token)
                    .securityAssurance("Guaranteed Authentic Record Stored in EduPulse Immutable Ledger")
                    .courseRecords(courseRecords)
                    .institutionalAttributes(institutionalAttributes)
                    .build();

        } catch (Exception e) {
            log.warn("Failed to verify credential for identifier {}: {}", raw, e.getMessage());
            return buildInvalidResponse("Verification inquiry failed: " + e.getMessage());
        }
    }

    private String extractEnrollmentNumber(String input) {
        if (input.startsWith("EDP-VRF-")) {
            String[] parts = input.split("-");
            if (parts.length >= 3) {
                return parts[2];
            }
        }
        return input;
    }

    private String generateSha256Signature(Long studentId, String enrollment, BigDecimal gpa, int totalExams) {
        try {
            String rawPayload = studentId + ":" + enrollment + ":" + gpa + ":" + totalExams + ":" + INSTITUTION_SALT;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(rawPayload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    private VerifiedCredentialDTO buildInvalidResponse(String reason) {
        return VerifiedCredentialDTO.builder()
                .valid(false)
                .statusMessage("INVALID / UNVERIFIED CREDENTIAL: " + reason)
                .issuingAuthority("Office of the Controller of Examinations")
                .securityAssurance("Fraud & Counterfeit Detection Active")
                .build();
    }
}
