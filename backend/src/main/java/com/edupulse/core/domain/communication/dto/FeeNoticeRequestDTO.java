package com.edupulse.core.domain.communication.dto;

import com.edupulse.core.domain.communication.CommunicationChannel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeNoticeRequestDTO {
    private String invoiceNumber;
    private String studentEnrollment;
    private String studentName;
    private String title;
    private BigDecimal amount;
    private String dueDate;
    private String recipientPhone;
    private CommunicationChannel channel;
}
