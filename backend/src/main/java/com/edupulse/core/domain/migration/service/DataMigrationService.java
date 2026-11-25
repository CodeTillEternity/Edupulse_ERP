package com.edupulse.core.domain.migration.service;

import com.edupulse.core.domain.academic.Batch;
import com.edupulse.core.domain.academic.Department;
import com.edupulse.core.domain.academic.repository.BatchRepository;
import com.edupulse.core.domain.academic.repository.DepartmentRepository;
import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.finance.FeeStructure;
import com.edupulse.core.domain.finance.InvoiceStatus;
import com.edupulse.core.domain.finance.StudentInvoice;
import com.edupulse.core.domain.finance.repository.FeeStructureRepository;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.migration.dto.*;
import com.edupulse.core.domain.student.EnrollmentStatus;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataMigrationService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final BatchRepository batchRepository;
    private final StudentInvoiceRepository invoiceRepository;
    private final FeeStructureRepository feeStructureRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    /**
     * Parse and validate CSV data for bulk student ingestion.
     */
    @Transactional(readOnly = true)
    public ImportValidationResultDTO<StudentImportRowDTO> validateStudentsCsv(InputStream is) {
        String tenantId = TenantContext.getTenantId();
        List<Department> departments = departmentRepository.findAll();
        List<Batch> batches = batchRepository.findAll();

        Map<String, Department> deptMap = new HashMap<>();
        for (Department d : departments) {
            deptMap.put(d.getCode().toUpperCase().trim(), d);
        }

        Map<String, Batch> batchMap = new HashMap<>();
        for (Batch b : batches) {
            batchMap.put(b.getName().toUpperCase().trim(), b);
        }

        List<StudentImportRowDTO> rows = new ArrayList<>();
        List<String> globalErrors = new ArrayList<>();
        Set<String> fileEnrollments = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            int lineNum = 0;
            boolean headerSkipped = false;

            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }

                List<String> tokens = parseCsvLine(line);
                if (tokens.isEmpty()) continue;

                // Check for header
                if (!headerSkipped) {
                    headerSkipped = true;
                    if (tokens.get(0).toLowerCase().contains("enrollment") || tokens.get(0).toLowerCase().contains("roll")) {
                        continue;
                    }
                }

                if (tokens.size() < 6) {
                    StudentImportRowDTO row = StudentImportRowDTO.builder()
                            .rowNumber(lineNum)
                            .valid(false)
                            .validationError("Insufficient columns (expected at least 6: enrollment, firstName, lastName, email, deptCode, batchName)")
                            .build();
                    rows.add(row);
                    continue;
                }

                String enrollment = tokens.get(0).trim();
                String firstName = tokens.get(1).trim();
                String lastName = tokens.get(2).trim();
                String email = tokens.get(3).trim();
                String deptCode = tokens.get(4).trim().toUpperCase();
                String batchName = tokens.get(5).trim();
                String phone = tokens.size() > 6 ? tokens.get(6).trim() : "";
                String category = tokens.size() > 7 ? tokens.get(7).trim().toUpperCase() : "GENERAL";
                String gender = tokens.size() > 8 ? tokens.get(8).trim().toUpperCase() : "OTHER";
                String status = tokens.size() > 9 ? tokens.get(9).trim().toUpperCase() : "ACTIVE";

                StudentImportRowDTO row = StudentImportRowDTO.builder()
                        .rowNumber(lineNum)
                        .enrollmentNumber(enrollment)
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .departmentCode(deptCode)
                        .batchName(batchName)
                        .phone(phone)
                        .category(category)
                        .gender(gender)
                        .status(status)
                        .valid(true)
                        .build();

                // Validations
                if (enrollment.isEmpty()) {
                    row.setValid(false);
                    row.setValidationError("Enrollment number is required.");
                } else if (!fileEnrollments.add(enrollment.toUpperCase())) {
                    row.setValid(false);
                    row.setValidationError("Duplicate enrollment number in uploaded file: " + enrollment);
                } else if (studentRepository.findByEnrollmentNumber(enrollment).isPresent()) {
                    row.setValid(false);
                    row.setValidationError("Enrollment number already exists in institutional database: " + enrollment);
                } else if (firstName.isEmpty()) {
                    row.setValid(false);
                    row.setValidationError("First name is required.");
                } else if (email.isEmpty() || !EMAIL_PATTERN.matcher(email).matches()) {
                    row.setValid(false);
                    row.setValidationError("Invalid email format: " + email);
                } else if (!deptMap.containsKey(deptCode)) {
                    row.setValid(false);
                    row.setValidationError("Unknown department code: '" + deptCode + "'. Available: " + deptMap.keySet());
                } else if (!batchMap.containsKey(batchName.toUpperCase())) {
                    row.setValid(false);
                    row.setValidationError("Unknown batch name: '" + batchName + "'. Available: " + batchMap.keySet());
                }

                rows.add(row);
            }
        } catch (Exception e) {
            log.error("Failed to parse student CSV: {}", e.getMessage(), e);
            globalErrors.add("CSV Read Error: " + e.getMessage());
        }

        int validCount = (int) rows.stream().filter(StudentImportRowDTO::isValid).count();
        int errorCount = rows.size() - validCount;

        return ImportValidationResultDTO.<StudentImportRowDTO>builder()
                .importType("STUDENTS")
                .totalRows(rows.size())
                .validRows(validCount)
                .errorRows(errorCount)
                .globalErrors(globalErrors)
                .rows(rows)
                .readyToCommit(errorCount == 0 && validCount > 0)
                .build();
    }

    /**
     * Atomically commit validated students into the multi-tenant database.
     */
    @Transactional
    public ImportExecutionResponseDTO commitStudents(List<StudentImportRowDTO> rows) {
        String tenantId = TenantContext.getTenantId();
        Map<String, Department> deptMap = new HashMap<>();
        for (Department d : departmentRepository.findAll()) {
            deptMap.put(d.getCode().toUpperCase().trim(), d);
        }

        Map<String, Batch> batchMap = new HashMap<>();
        for (Batch b : batchRepository.findAll()) {
            batchMap.put(b.getName().toUpperCase().trim(), b);
        }

        List<String> committedIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;

        for (StudentImportRowDTO r : rows) {
            if (!r.isValid()) {
                errors.add("Row " + r.getRowNumber() + " skipped due to previous validation error: " + r.getValidationError());
                continue;
            }

            try {
                Department dept = deptMap.get(r.getDepartmentCode().toUpperCase().trim());
                Batch batch = batchMap.get(r.getBatchName().toUpperCase().trim());

                if (dept == null || batch == null) {
                    errors.add("Row " + r.getRowNumber() + " failed: missing department or batch.");
                    continue;
                }

                Student student = new Student();
                student.setEnrollmentNumber(r.getEnrollmentNumber());
                student.setFirstName(r.getFirstName());
                student.setLastName(r.getLastName());
                student.setEmail(r.getEmail());
                student.setDepartment(dept);
                student.setBatch(batch);
                student.setStatus("INACTIVE".equalsIgnoreCase(r.getStatus()) || "SUSPENDED".equalsIgnoreCase(r.getStatus()) ? EnrollmentStatus.SUSPENDED : EnrollmentStatus.ACTIVE);
                student.setTenantId(tenantId);

                studentRepository.save(student);
                committedIds.add(student.getEnrollmentNumber());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to persist student row {}: {}", r.getRowNumber(), e.getMessage());
                errors.add("Row " + r.getRowNumber() + " persistence error: " + e.getMessage());
            }
        }

        return ImportExecutionResponseDTO.builder()
                .importType("STUDENTS")
                .successCount(successCount)
                .failureCount(errors.size())
                .message("Successfully onboarded " + successCount + " student records into tenant [" + tenantId + "]")
                .committedIdentifiers(committedIds)
                .errorMessages(errors)
                .build();
    }

    /**
     * Parse and validate CSV data for historical fee invoices.
     */
    @Transactional(readOnly = true)
    public ImportValidationResultDTO<FeeInvoiceImportRowDTO> validateInvoicesCsv(InputStream is) {
        List<FeeStructure> structures = feeStructureRepository.findAll();
        Map<String, FeeStructure> structureMap = new HashMap<>();
        for (FeeStructure fs : structures) {
            structureMap.put(fs.getName().toUpperCase().trim(), fs);
        }

        List<FeeInvoiceImportRowDTO> rows = new ArrayList<>();
        List<String> globalErrors = new ArrayList<>();
        Set<String> fileInvoices = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            int lineNum = 0;
            boolean headerSkipped = false;

            while ((line = reader.readLine()) != null) {
                lineNum++;
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                List<String> tokens = parseCsvLine(line);
                if (tokens.isEmpty()) continue;

                if (!headerSkipped) {
                    headerSkipped = true;
                    if (tokens.get(0).toLowerCase().contains("invoice")) continue;
                }

                if (tokens.size() < 5) {
                    rows.add(FeeInvoiceImportRowDTO.builder()
                            .rowNumber(lineNum)
                            .valid(false)
                            .validationError("Insufficient columns (expected: invoiceNumber, enrollmentNumber, structureName, grossAmount, amountPaid, [discount], [dueDate])")
                            .build());
                    continue;
                }

                String invoiceNum = tokens.get(0).trim();
                String enrollment = tokens.get(1).trim();
                String structureName = tokens.get(2).trim();
                String grossStr = tokens.get(3).trim();
                String paidStr = tokens.get(4).trim();
                String discountStr = tokens.size() > 5 ? tokens.get(5).trim() : "0";
                String dueDateStr = tokens.size() > 6 ? tokens.get(6).trim() : LocalDate.now().plusMonths(1).toString();

                BigDecimal gross = BigDecimal.ZERO;
                BigDecimal paid = BigDecimal.ZERO;
                BigDecimal discount = BigDecimal.ZERO;
                LocalDate dueDate = LocalDate.now().plusMonths(1);

                FeeInvoiceImportRowDTO row = FeeInvoiceImportRowDTO.builder()
                        .rowNumber(lineNum)
                        .invoiceNumber(invoiceNum)
                        .enrollmentNumber(enrollment)
                        .feeStructureName(structureName)
                        .valid(true)
                        .build();

                try {
                    gross = new BigDecimal(grossStr);
                    row.setGrossAmount(gross);
                } catch (Exception e) {
                    row.setValid(false);
                    row.setValidationError("Invalid gross amount: " + grossStr);
                }

                try {
                    paid = new BigDecimal(paidStr);
                    row.setAmountPaid(paid);
                } catch (Exception e) {
                    row.setValid(false);
                    row.setValidationError("Invalid amount paid: " + paidStr);
                }

                try {
                    discount = new BigDecimal(discountStr);
                    row.setDiscount(discount);
                } catch (Exception ignored) {
                    row.setDiscount(BigDecimal.ZERO);
                }

                try {
                    dueDate = LocalDate.parse(dueDateStr);
                    row.setDueDate(dueDate);
                } catch (Exception ignored) {
                    row.setDueDate(LocalDate.now().plusMonths(1));
                }

                if (row.isValid()) {
                    if (invoiceNum.isEmpty()) {
                        row.setValid(false);
                        row.setValidationError("Invoice number is required.");
                    } else if (!fileInvoices.add(invoiceNum.toUpperCase())) {
                        row.setValid(false);
                        row.setValidationError("Duplicate invoice number in file: " + invoiceNum);
                    } else if (invoiceRepository.findByInvoiceNumber(invoiceNum).isPresent()) {
                        row.setValid(false);
                        row.setValidationError("Invoice number already exists: " + invoiceNum);
                    } else if (studentRepository.findByEnrollmentNumber(enrollment).isEmpty()) {
                        row.setValid(false);
                        row.setValidationError("Student enrollment not found in system: " + enrollment);
                    } else if (!structureMap.containsKey(structureName.toUpperCase())) {
                        row.setValid(false);
                        row.setValidationError("Fee structure not found: '" + structureName + "'. Available: " + structureMap.keySet());
                    }
                }

                rows.add(row);
            }
        } catch (Exception e) {
            log.error("Failed to parse invoice CSV: {}", e.getMessage(), e);
            globalErrors.add("CSV Read Error: " + e.getMessage());
        }

        int validCount = (int) rows.stream().filter(FeeInvoiceImportRowDTO::isValid).count();
        int errorCount = rows.size() - validCount;

        return ImportValidationResultDTO.<FeeInvoiceImportRowDTO>builder()
                .importType("FEE_INVOICES")
                .totalRows(rows.size())
                .validRows(validCount)
                .errorRows(errorCount)
                .globalErrors(globalErrors)
                .rows(rows)
                .readyToCommit(errorCount == 0 && validCount > 0)
                .build();
    }

    /**
     * Atomically commit validated invoices into the database.
     */
    @Transactional
    public ImportExecutionResponseDTO commitInvoices(List<FeeInvoiceImportRowDTO> rows) {
        String tenantId = TenantContext.getTenantId();
        Map<String, FeeStructure> structureMap = new HashMap<>();
        for (FeeStructure fs : feeStructureRepository.findAll()) {
            structureMap.put(fs.getName().toUpperCase().trim(), fs);
        }

        List<String> committedIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int successCount = 0;

        for (FeeInvoiceImportRowDTO r : rows) {
            if (!r.isValid()) continue;

            try {
                Optional<Student> studentOpt = studentRepository.findByEnrollmentNumber(r.getEnrollmentNumber());
                FeeStructure structure = structureMap.get(r.getFeeStructureName().toUpperCase().trim());

                if (studentOpt.isEmpty() || structure == null) {
                    errors.add("Row " + r.getRowNumber() + " failed: Student or structure missing.");
                    continue;
                }

                Student student = studentOpt.get();
                BigDecimal gross = r.getGrossAmount() != null ? r.getGrossAmount() : BigDecimal.ZERO;
                BigDecimal disc = r.getDiscount() != null ? r.getDiscount() : BigDecimal.ZERO;
                BigDecimal net = gross.subtract(disc);
                BigDecimal paid = r.getAmountPaid() != null ? r.getAmountPaid() : BigDecimal.ZERO;

                StudentInvoice invoice = new StudentInvoice();
                invoice.setInvoiceNumber(r.getInvoiceNumber());
                invoice.setStudent(student);
                invoice.setFeeStructure(structure);
                invoice.setGrossAmount(gross);
                invoice.setDiscount(disc);
                invoice.setNetAmount(net);
                invoice.setAmountPaid(paid);
                invoice.setDueDate(r.getDueDate() != null ? r.getDueDate() : LocalDate.now().plusMonths(1));

                if (paid.compareTo(net) >= 0) {
                    invoice.setStatus(InvoiceStatus.PAID);
                } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
                    invoice.setStatus(InvoiceStatus.PARTIAL);
                } else {
                    invoice.setStatus(InvoiceStatus.UNPAID);
                }

                invoice.setTenantId(tenantId);
                invoiceRepository.save(invoice);
                committedIds.add(invoice.getInvoiceNumber());
                successCount++;
            } catch (Exception e) {
                log.error("Failed to persist invoice row {}: {}", r.getRowNumber(), e.getMessage());
                errors.add("Row " + r.getRowNumber() + " invoice save error: " + e.getMessage());
            }
        }

        return ImportExecutionResponseDTO.builder()
                .importType("FEE_INVOICES")
                .successCount(successCount)
                .failureCount(errors.size())
                .message("Successfully created " + successCount + " fee invoices for tenant [" + tenantId + "]")
                .committedIdentifiers(committedIds)
                .errorMessages(errors)
                .build();
    }

    /**
     * Downloadable sample CSV templates with prefilled example rows.
     */
    public String getSampleTemplateCsv(String type) {
        if ("students".equalsIgnoreCase(type)) {
            return "enrollmentNumber,firstName,lastName,email,departmentCode,batchName,phone,category,gender,status\n"
                    + "24CSM101,Rohan,Verma,rohan.verma@institution.edu,CSE,2023-2027,+919876543210,GENERAL,MALE,ACTIVE\n"
                    + "24CSM102,Priya,Nair,priya.nair@institution.edu,CSE,2023-2027,+919876543211,OBC,FEMALE,ACTIVE\n"
                    + "24ECM045,Ananya,Iyer,ananya.iyer@institution.edu,ECE,2023-2027,+919876543212,GENERAL,FEMALE,ACTIVE\n";
        } else if ("fees".equalsIgnoreCase(type) || "invoices".equalsIgnoreCase(type)) {
            return "invoiceNumber,enrollmentNumber,feeStructureName,grossAmount,amountPaid,discount,dueDate\n"
                    + "INV-2026-MIG-001,23CSM001,B.Tech CSE - 2026 Regular,65000.00,65000.00,0.00,2026-12-31\n"
                    + "INV-2026-MIG-002,23CSM002,B.Tech CSE - 2026 Regular,65000.00,30000.00,5000.00,2026-12-31\n"
                    + "INV-2026-MIG-003,23ECM001,B.Tech ECE - 2026 Regular,60000.00,0.00,0.00,2026-12-31\n";
        }
        return "id,name,value\n";
    }

    private List<String> parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '\"') {
                inQuotes = !inQuotes;
            } else if (ch == ',' && !inQuotes) {
                result.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(ch);
            }
        }
        result.add(cur.toString().trim());
        return result;
    }
}
