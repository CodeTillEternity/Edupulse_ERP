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
public class ImportValidationResultDTO<T> {
    private String importType;
    private int totalRows;
    private int validRows;
    private int errorRows;
    @Builder.Default
    private List<String> globalErrors = new ArrayList<>();
    @Builder.Default
    private List<T> rows = new ArrayList<>();
    private boolean readyToCommit;
}
