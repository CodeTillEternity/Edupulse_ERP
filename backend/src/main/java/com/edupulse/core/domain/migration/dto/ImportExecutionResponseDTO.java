package com.edupulse.core.domain.migration.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportExecutionResponseDTO {
    private String importType;
    private int successCount;
    private int failureCount;
    private String message;
    @Builder.Default
    private List<String> committedIdentifiers = new ArrayList<>();
    @Builder.Default
    private List<String> errorMessages = new ArrayList<>();
}
