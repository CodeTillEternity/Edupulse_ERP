package com.edupulse.core.domain.communication.dto;

import com.edupulse.core.domain.communication.CommunicationChannel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallTicketDispatchRequestDTO {
    private Long examId;
    private Long batchId;
    private String examTitle;
    private String examDate;
    private String hallLocation;
    private CommunicationChannel channel;
}
