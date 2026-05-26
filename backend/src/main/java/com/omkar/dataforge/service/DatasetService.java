package com.omkar.dataforge.service;

import com.omkar.dataforge.dto.PaginatedResponseDto;
import com.omkar.dataforge.dto.UploadResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DatasetService {

        private final CsvService csvService;

        private final TableService tableService;

        public UploadResponseDto uploadDataset(MultipartFile file) {

                validateFile(file);
                UUID datasetId = UUID.randomUUID();
                String tableName = "dataset_" + datasetId.toString().replace("-", "_");

                List<String> columns = csvService.extractHeaders(file);

                tableService.createDynamicTable(tableName, columns);

                long rowCount = csvService.processCsvAndInsert(file, columns, tableName, tableService);

                return UploadResponseDto.builder().datasetId(datasetId).tableName(tableName).rowCount(rowCount)
                                .columns(columns).build();
        }

        public PaginatedResponseDto getDatasetRows( String tableName, int page, int size, String search, String sortBy, String sortDir, Map<String, String> allParams) {
                
                return tableService.fetchRows(tableName,page,size,search,sortBy,sortDir,allParams);
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
