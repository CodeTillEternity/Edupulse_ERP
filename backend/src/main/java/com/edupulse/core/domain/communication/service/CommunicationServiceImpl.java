package com.edupulse.core.domain.communication.service;

import com.edupulse.core.domain.academic.Exam;
import com.edupulse.core.domain.academic.repository.ExamRepository;
import com.edupulse.core.domain.communication.CommunicationChannel;
import com.edupulse.core.domain.communication.CommunicationLog;
import com.edupulse.core.domain.communication.DeliveryStatus;
import com.edupulse.core.domain.communication.TriggerType;
import com.edupulse.core.domain.communication.dto.AbsenceAlertRequestDTO;
import com.edupulse.core.domain.communication.dto.CommunicationResponseDTO;
import com.edupulse.core.domain.communication.dto.FeeNoticeRequestDTO;
import com.edupulse.core.domain.communication.dto.HallTicketDispatchRequestDTO;
import com.edupulse.core.domain.communication.repository.CommunicationLogRepository;
import com.edupulse.core.domain.finance.StudentInvoice;
import com.edupulse.core.domain.finance.repository.StudentInvoiceRepository;
import com.edupulse.core.domain.operations.TimetableEntry;
import com.edupulse.core.domain.operations.repository.TimetableRepository;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import com.edupulse.core.domain.base.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service("coreCommunicationService")
public class CommunicationServiceImpl implements CommunicationService {

    private final CommunicationLogRepository communicationLogRepository;
    private final StudentRepository studentRepository;
    private final StudentInvoiceRepository invoiceRepository;
    private final ExamRepository examRepository;
    private final TimetableRepository timetableRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${WHATSAPP_PHONE_NUMBER_ID:${app.communication.whatsapp.phone-number-id:}}")
    private String whatsappPhoneNumberId;

    @Value("${WHATSAPP_API_TOKEN:${app.communication.whatsapp.api-token:}}")
    private String whatsappApiToken;

    @Value("${SMS_API_KEY:${app.communication.sms.api-key:}}")
    private String smsApiKey;

    public CommunicationServiceImpl(
            @Qualifier("coreCommunicationLogRepository") CommunicationLogRepository communicationLogRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository,
            @Qualifier("coreStudentInvoiceRepository") StudentInvoiceRepository invoiceRepository,
            @Qualifier("coreExamRepository") ExamRepository examRepository,
            @Qualifier("coreTimetableRepository") TimetableRepository timetableRepository) {
        this.communicationLogRepository = communicationLogRepository;
        this.studentRepository = studentRepository;
        this.invoiceRepository = invoiceRepository;
        this.examRepository = examRepository;
        this.timetableRepository = timetableRepository;
    }

    private String getActiveTenantId() {
        String tenantId = TenantContext.getTenantId();
        return (tenantId != null && !tenantId.isBlank()) ? tenantId : "default";
    }

    public boolean isLiveWhatsAppMode() {
        return whatsappPhoneNumberId != null && !whatsappPhoneNumberId.isBlank()
                && whatsappApiToken != null && !whatsappApiToken.isBlank();
    }

    @Override
    @Transactional
    public List<CommunicationResponseDTO> dispatchAbsenceAlerts(AbsenceAlertRequestDTO request) {
        String tenantId = getActiveTenantId();
        List<CommunicationResponseDTO> responses = new ArrayList<>();

        if (request.getAbsentStudentIds() == null || request.getAbsentStudentIds().isEmpty()) {
            return responses;
        }

        String courseName = (request.getCourseName() != null && !request.getCourseName().isBlank())
                ? request.getCourseName()
                : "Scheduled Lecture";
        String timeSlot = (request.getTimeSlot() != null && !request.getTimeSlot().isBlank())
                ? request.getTimeSlot()
                : "Morning Session";
        String dateStr = (request.getDate() != null)
                ? request.getDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))
                : LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"));

        if (request.getTimetableEntryId() != null) {
            Optional<TimetableEntry> entryOpt = timetableRepository.findById(request.getTimetableEntryId());
            if (entryOpt.isPresent()) {
                TimetableEntry entry = entryOpt.get();
                if (entry.getCourseOffering() != null && entry.getCourseOffering().getCourse() != null) {
                    courseName = entry.getCourseOffering().getCourse().getCode() + ": " + entry.getCourseOffering().getCourse().getName();
                }
                timeSlot = entry.getStartTime() + " - " + entry.getEndTime();
            }
        }

        for (Long studentId : request.getAbsentStudentIds()) {
            Optional<Student> studentOpt = studentRepository.findByIdAndTenantId(studentId, tenantId);
            if (studentOpt.isEmpty()) {
                continue;
            }
            Student student = studentOpt.get();
            String studentName = student.getFirstName() + " " + student.getLastName();
            String enrollment = student.getEnrollmentNumber();
            String phone = "+919829012345"; // Canonical demo guardian phone
            String parentName = "Parent/Guardian of " + studentName;
            String refCode = "ABS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            String message = String.format(
                    "🏛️ *Arya College of Engineering & IT*\n" +
                    "🚨 *Daily Attendance Alert*\n\n" +
                    "Dear %s,\n" +
                    "This is an official notice from the Office of the Dean.\n" +
                    "Your ward, *%s* (Enrollment: *%s*), was marked *ABSENT* for *%s* today (%s, %s).\n\n" +
                    "For attendance regularization or medical leave, please contact the department office.\n" +
                    "Verification Ref: *%s*",
                    parentName, studentName, enrollment, courseName, dateStr, timeSlot, refCode
            );

            CommunicationLog logEntry = dispatchMessage(
                    CommunicationChannel.WHATSAPP,
                    TriggerType.ABSENCE_ALERT,
                    phone,
                    parentName,
                    enrollment,
                    studentName,
                    "Attendance Absence Alert: " + studentName,
                    message,
                    refCode
            );

            responses.add(mapToResponse(logEntry));
        }

        log.info("Dispatched {} absence alerts for tenant [{}]", responses.size(), tenantId);
        return responses;
    }

    @Override
    @Transactional
    public CommunicationResponseDTO dispatchFeeNotice(FeeNoticeRequestDTO request) {
        String tenantId = getActiveTenantId();
        String invoiceNumber = request.getInvoiceNumber();
        String studentName = (request.getStudentName() != null && !request.getStudentName().isBlank())
                ? request.getStudentName() : "Aarav Sharma";
        String enrollment = (request.getStudentEnrollment() != null && !request.getStudentEnrollment().isBlank())
                ? request.getStudentEnrollment() : "23CSM001";
        String amountStr = (request.getAmount() != null)
                ? String.format("₹%,.2f", request.getAmount()) : "₹15,000.00";
        String dueDate = (request.getDueDate() != null && !request.getDueDate().isBlank())
                ? request.getDueDate() : "Dec 20, 2026";
        String feeTitle = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle() : "Academic Fee Assessment";
        String phone = (request.getRecipientPhone() != null && !request.getRecipientPhone().isBlank())
                ? request.getRecipientPhone() : "+919829012345";

        if (invoiceNumber != null && !invoiceNumber.isBlank()) {
            Optional<StudentInvoice> invOpt = invoiceRepository.findByInvoiceNumberAndTenantId(invoiceNumber, tenantId);
            if (invOpt.isPresent()) {
                StudentInvoice inv = invOpt.get();
                if (inv.getStudent() != null) {
                    studentName = inv.getStudent().getFirstName() + " " + inv.getStudent().getLastName();
                    enrollment = inv.getStudent().getEnrollmentNumber();
                }
                amountStr = String.format("₹%,.2f", inv.getNetAmount() != null ? inv.getNetAmount() : BigDecimal.ZERO);
                if (inv.getDueDate() != null) {
                    dueDate = inv.getDueDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"));
                }
                if (inv.getFeeStructure() != null) {
                    feeTitle = inv.getFeeStructure().getName();
                }
            }
        }

        String refCode = "FEE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String paymentLink = "https://pay.edupulse.org/rzp/" + (invoiceNumber != null ? invoiceNumber : "INV-DEMO");

        String message = String.format(
                "🏛️ *Arya College of Engineering & IT*\n" +
                "💳 *Tuition & Fee Assessment Notice*\n\n" +
                "Dear Parent/Guardian of *%s* (Roll: *%s*),\n" +
                "Institutional fee invoice *#%s* for *%s* is pending clearance.\n\n" +
                "*Payable Amount:* %s\n" +
                "*Due Date:* %s\n" +
                "*Direct Razorpay Payment Link:* %s\n\n" +
                "You can settle online instantly using UPI (GPay/PhonePe/Paytm), Cards, or NetBanking.\n" +
                "Reference ID: *%s*",
                studentName, enrollment, invoiceNumber, feeTitle, amountStr, dueDate, paymentLink, refCode
        );

        CommunicationLog logEntry = dispatchMessage(
                request.getChannel() != null ? request.getChannel() : CommunicationChannel.WHATSAPP,
                TriggerType.FEE_DUE_NOTICE,
                phone,
                "Parent of " + studentName,
                enrollment,
                studentName,
                "Fee Due Notice: " + invoiceNumber,
                message,
                refCode
        );

        return mapToResponse(logEntry);
    }

    @Override
    @Transactional
    public CommunicationResponseDTO dispatchFeeReceipt(String invoiceNumber) {
        String tenantId = getActiveTenantId();
        String studentName = "Aarav Sharma";
        String enrollment = "23CSM001";
        String amountStr = "₹45,000.00";
        String paymentMethod = "Razorpay Online (UPI Rail)";
        String transactionRef = "PAY_RZP_" + System.currentTimeMillis();
        String phone = "+919829012345";

        if (invoiceNumber != null && !invoiceNumber.isBlank()) {
            Optional<StudentInvoice> invOpt = invoiceRepository.findByInvoiceNumberAndTenantId(invoiceNumber, tenantId);
            if (invOpt.isPresent()) {
                StudentInvoice inv = invOpt.get();
                if (inv.getStudent() != null) {
                    studentName = inv.getStudent().getFirstName() + " " + inv.getStudent().getLastName();
                    enrollment = inv.getStudent().getEnrollmentNumber();
                }
                amountStr = String.format("₹%,.2f", inv.getNetAmount() != null ? inv.getNetAmount() : BigDecimal.ZERO);
            }
        }

        String refCode = "REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String message = String.format(
                "🏛️ *Arya College of Engineering & IT*\n" +
                "✅ *Institutional Fee Clearance Receipt*\n\n" +
                "Dear Parent/Student,\n" +
                "Your payment for invoice *#%s* has been reconciled and approved by the Bursar Office.\n\n" +
                "*Student:* %s (%s)\n" +
                "*Amount Paid:* %s\n" +
                "*Payment Mode:* %s\n" +
                "*Transaction ID:* %s\n" +
                "*Status:* SETTLED & VERIFIED\n\n" +
                "Official digital stamp: *%s*\n" +
                "Download full PDF receipt: https://app.edupulse.org/portal/fees",
                invoiceNumber != null ? invoiceNumber : "INV-PAID",
                studentName, enrollment, amountStr, paymentMethod, transactionRef, refCode
        );

        CommunicationLog logEntry = dispatchMessage(
                CommunicationChannel.WHATSAPP,
                TriggerType.FEE_PAYMENT_RECEIPT,
                phone,
                studentName,
                enrollment,
                studentName,
                "Fee Receipt Confirmation: " + invoiceNumber,
                message,
                refCode
        );

        return mapToResponse(logEntry);
    }

    @Override
    @Transactional
    public List<CommunicationResponseDTO> dispatchHallTickets(HallTicketDispatchRequestDTO request) {
        String tenantId = getActiveTenantId();
        List<CommunicationResponseDTO> responses = new ArrayList<>();

        Long batchId = (request.getBatchId() != null) ? request.getBatchId() : 1L;
        List<Student> students = studentRepository.findByBatchIdAndTenantId(batchId, tenantId);
        if (students.isEmpty()) {
            students = studentRepository.findAllByTenantId(tenantId);
        }

        String examTitle = (request.getExamTitle() != null && !request.getExamTitle().isBlank())
                ? request.getExamTitle() : "Mid-Term Examination (Fall 2026)";
        String examDate = (request.getExamDate() != null && !request.getExamDate().isBlank())
                ? request.getExamDate() : "Dec 10, 2026 - 10:00 AM";
        String location = (request.getHallLocation() != null && !request.getHallLocation().isBlank())
                ? request.getHallLocation() : "Academic Block C, Hall 304";

        if (request.getExamId() != null) {
            Optional<Exam> examOpt = examRepository.findByIdAndTenantId(request.getExamId(), tenantId);
            if (examOpt.isPresent()) {
                Exam exam = examOpt.get();
                examTitle = exam.getTitle();
                if (exam.getExamDate() != null) {
                    examDate = exam.getExamDate().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy"))
                            + (exam.getScheduledStartTime() != null ? " (" + exam.getScheduledStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")) + ")" : "");
                }
            }
        }

        for (Student s : students) {
            String studentName = s.getFirstName() + " " + s.getLastName();
            String enrollment = s.getEnrollmentNumber();
            String phone = "+919829012345";
            String refCode = "ADMIT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

            String message = String.format(
                    "🏛️ *Arya College of Engineering & IT*\n" +
                    "🎟️ *Examination Admit Card & Hall Ticket*\n\n" +
                    "Dear *%s* (Roll: *%s*),\n" +
                    "Your admit card for *%s* has been generated and validated by the Controller of Examinations.\n\n" +
                    "*Exam Schedule:* %s\n" +
                    "*Center / Hall:* %s\n" +
                    "*Reporting Time:* 30 mins prior to commencement\n" +
                    "*Digital Admit Token:* %s\n\n" +
                    "Access your verified QR pass: https://app.edupulse.org/portal/academics\n" +
                    "Carry your physical institutional identity card to the hall.",
                    studentName, enrollment, examTitle, examDate, location, refCode
            );

            CommunicationLog logEntry = dispatchMessage(
                    request.getChannel() != null ? request.getChannel() : CommunicationChannel.WHATSAPP,
                    TriggerType.EXAM_HALL_TICKET,
                    phone,
                    studentName,
                    enrollment,
                    studentName,
                    "Admit Card Dispatch: " + examTitle,
                    message,
                    refCode
            );

            responses.add(mapToResponse(logEntry));
        }

        log.info("Dispatched {} exam hall tickets for exam [{}]", responses.size(), examTitle);
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommunicationResponseDTO> getOutboxLogs(int limit) {
        String tenantId = getActiveTenantId();
        List<CommunicationLog> logs = communicationLogRepository.findByTenantIdOrderBySentAtDesc(tenantId);
        int max = Math.min(limit > 0 ? limit : 50, logs.size());
        return logs.subList(0, max).stream().map(this::mapToResponse).toList();
    }

    @Override
    public Map<String, String> getGatewayStatus() {
        Map<String, String> status = new HashMap<>();
        boolean isLive = isLiveWhatsAppMode();
        status.put("mode", isLive ? "LIVE_META_CLOUD" : "INTERACTIVE_SIMULATOR");
        status.put("whatsappPhoneNumberId", (whatsappPhoneNumberId != null && !whatsappPhoneNumberId.isBlank()) ? whatsappPhoneNumberId : "SIMULATED_GATEWAY_NODE");
        status.put("provider", "Meta WhatsApp Business Graph API v21.0 & Fast2SMS");
        status.put("health", "ACTIVE_READY");
        return status;
    }

    private CommunicationLog dispatchMessage(
            CommunicationChannel channel,
            TriggerType triggerType,
            String phone,
            String recipientName,
            String enrollment,
            String studentName,
            String subject,
            String message,
            String refCode) {

        String cleanPhone = phone.replaceAll("[^0-9]", "");
        String encodedMsg = URLEncoder.encode(message, StandardCharsets.UTF_8);
        String directChatLink = "https://wa.me/" + cleanPhone + "?text=" + encodedMsg;
        DeliveryStatus deliveryStatus = DeliveryStatus.SIMULATED;
        String gatewayRef = "SIM-WA-" + refCode;

        if (isLiveWhatsAppMode() && channel == CommunicationChannel.WHATSAPP) {
            try {
                String metaUrl = "https://graph.facebook.com/v21.0/" + whatsappPhoneNumberId + "/messages";
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(whatsappApiToken);

                Map<String, Object> body = new HashMap<>();
                body.put("messaging_product", "whatsapp");
                body.put("to", cleanPhone);
                body.put("type", "text");
                Map<String, String> textObj = new HashMap<>();
                textObj.put("body", message);
                body.put("text", textObj);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<Map> metaResponse = restTemplate.postForEntity(metaUrl, entity, Map.class);
                if (metaResponse.getStatusCode().is2xxSuccessful()) {
                    deliveryStatus = DeliveryStatus.DELIVERED;
                    gatewayRef = "META-" + UUID.randomUUID().toString().substring(0, 10);
                }
            } catch (Exception e) {
                log.warn("Meta Cloud API dispatch fallback to simulated log: {}", e.getMessage());
                deliveryStatus = DeliveryStatus.SIMULATED;
            }
        }

        CommunicationLog logEntry = CommunicationLog.builder()
                .channel(channel)
                .triggerType(triggerType)
                .recipientPhone(phone)
                .recipientName(recipientName)
                .studentEnrollment(enrollment)
                .studentName(studentName)
                .subject(subject)
                .messageContent(message)
                .deliveryStatus(deliveryStatus)
                .gatewayReferenceId(gatewayRef)
                .directChatLink(directChatLink)
                .sentAt(LocalDateTime.now())
                .build();

        return communicationLogRepository.save(logEntry);
    }

    private CommunicationResponseDTO mapToResponse(CommunicationLog log) {
        return CommunicationResponseDTO.builder()
                .id(log.getId())
                .channel(log.getChannel())
                .triggerType(log.getTriggerType())
                .recipientPhone(log.getRecipientPhone())
                .recipientName(log.getRecipientName())
                .studentEnrollment(log.getStudentEnrollment())
                .studentName(log.getStudentName())
                .subject(log.getSubject())
                .messageContent(log.getMessageContent())
                .deliveryStatus(log.getDeliveryStatus())
                .gatewayReferenceId(log.getGatewayReferenceId())
                .directChatLink(log.getDirectChatLink())
                .sentAt(log.getSentAt())
                .build();
    }
}
