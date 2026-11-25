package com.edupulse.core.domain.communication.dto;

import com.edupulse.core.domain.communication.CommunicationChannel;
import com.edupulse.core.domain.communication.DeliveryStatus;
import com.edupulse.core.domain.communication.TriggerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunicationResponseDTO {
    private Long id;
    private CommunicationChannel channel;
    private TriggerType triggerType;
    private String recipientPhone;
    private String recipientName;
    private String studentEnrollment;
    private String studentName;
    private String subject;
    private String messageContent;
    private DeliveryStatus deliveryStatus;
    private String gatewayReferenceId;
    private String directChatLink;
    private LocalDateTime sentAt;
}
