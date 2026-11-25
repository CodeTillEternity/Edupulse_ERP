package com.edupulse.core.domain.communication;

import com.edupulse.core.domain.base.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

@Entity(name = "AcademicCoreCommunicationLog")
@Table(name = "academic_core_communication_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class CommunicationLog extends BaseTenantEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 30)
    private CommunicationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "trigger_type", nullable = false, length = 50)
    private TriggerType triggerType;

    @Column(name = "recipient_phone", nullable = false, length = 30)
    private String recipientPhone;

    @Column(name = "recipient_name", length = 120)
    private String recipientName;

    @Column(name = "student_enrollment", length = 50)
    private String studentEnrollment;

    @Column(name = "student_name", length = 150)
    private String studentName;

    @Column(name = "subject", length = 200)
    private String subject;

    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false, length = 30)
    private DeliveryStatus deliveryStatus;

    @Column(name = "gateway_reference_id", length = 100)
    private String gatewayReferenceId;

    @Column(name = "direct_chat_link", length = 1000)
    private String directChatLink;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;
}
