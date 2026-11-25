package com.edupulse.core.domain.communication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AbsenceAlertRequestDTO {
    private Long timetableEntryId;
    private LocalDate date;
    private List<Long> absentStudentIds;
    private String courseName;
    private String roomNumber;
    private String timeSlot;
    private Boolean autoDispatch;
}
