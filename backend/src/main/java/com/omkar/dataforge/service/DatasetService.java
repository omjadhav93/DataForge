package com.omkar.dataforge.service;

import com.omkar.dataforge.dto.PaginatedResponseDto;
import com.omkar.dataforge.dto.UploadResponseDto;
import com.omkar.dataforge.entity.DatasetMetadata;
import com.omkar.dataforge.exception.DatasetNotFoundException;
import com.omkar.dataforge.repository.DatasetMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DatasetService {

        private final CsvService csvService;

        private final TableService tableService;

        private final DatasetMetadataRepository metadataRepository;

        public UploadResponseDto uploadDataset(MultipartFile file) {

                validateFile(file);
                UUID datasetId = UUID.randomUUID();
                String tableName = "dataset_" + datasetId.toString().replace("-", "_");

                List<String> columns = csvService.extractHeaders(file);

                tableService.createDynamicTable(tableName, columns);

                long rowCount = csvService.processCsvAndInsert(file, columns, tableName, tableService);

                LocalDateTime now = LocalDateTime.now();
                metadataRepository.save(
                        DatasetMetadata.builder()
                                .id(datasetId)
                                .originalFileName(file.getOriginalFilename())
                                .tableName(tableName)
                                .rowCount(rowCount)
                                .uploadedAt(now)
                                .lastAccessedAt(now)
                                .build()
                );

                return UploadResponseDto.builder().datasetId(datasetId).tableName(tableName).rowCount(rowCount).columns(columns).originalFileName(file.getOriginalFilename()).build();
        }

        public PaginatedResponseDto getDatasetRows( String tableName, int page, int size, String search, String sortBy, String sortDir, List<String> filterColumn, List<String> filterValue, List<String> filterConjunction, Map<String, String> allParams) {
                DatasetMetadata metadata = metadataRepository.findByTableName(tableName)
                        .orElseThrow(() -> new DatasetNotFoundException(tableName));
                metadata.setLastAccessedAt(LocalDateTime.now());
                metadataRepository.save(metadata);

                return tableService.fetchRows(tableName,page,size,search,sortBy,sortDir,filterColumn,filterValue,filterConjunction,allParams);
        }

        public UploadResponseDto getDatasetMetadata(String tableName) {
                DatasetMetadata metadata = metadataRepository.findByTableName(tableName)
                        .orElseThrow(() -> new DatasetNotFoundException(tableName));
                return UploadResponseDto.builder()
                        .datasetId(metadata.getId())
                        .tableName(metadata.getTableName())
                        .rowCount(metadata.getRowCount())
                        .originalFileName(metadata.getOriginalFileName())
                        .build();
        }

        private void validateFile(MultipartFile file) {

                if (file.isEmpty()) {
                        throw new RuntimeException("File is empty");
                }

                String fileName = file.getOriginalFilename();

                if (fileName == null || !fileName.endsWith(".csv")) {
                        throw new RuntimeException("Only CSV files are allowed");
                }
        }
}

