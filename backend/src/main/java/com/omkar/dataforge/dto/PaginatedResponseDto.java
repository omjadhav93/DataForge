package com.omkar.dataforge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class PaginatedResponseDto {

    private List<Map<String, Object>> data;

    private long totalRows;

    private int page;

    private int size;

    private int totalPages;
}