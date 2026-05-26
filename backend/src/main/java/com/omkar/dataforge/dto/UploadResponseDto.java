package com.omkar.dataforge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class UploadResponseDto {

    private UUID datasetId;

    private String tableName;

    private Long rowCount;

    private String originalFileName;

    private List<String> columns;
}