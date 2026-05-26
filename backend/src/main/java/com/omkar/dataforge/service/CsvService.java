package com.omkar.dataforge.service;

import com.omkar.dataforge.util.SqlSanitizerUtil;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CsvService {

    public List<String> extractHeaders( MultipartFile file ) {
        try {
            Reader reader = new InputStreamReader( file.getInputStream() );
            CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(reader);
            List<String> sanitizedHeaders = new ArrayList<>();

            for ( String header : parser.getHeaderMap().keySet() ) {
                sanitizedHeaders.add(SqlSanitizerUtil.sanitizeColumnName(header));
            }

            return sanitizedHeaders;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV headers");
        }
    }

    public long processCsvAndInsert( MultipartFile file, List<String> columns, String tableName, TableService tableService ) {
        try {

            Reader reader = new InputStreamReader(file.getInputStream());
            CSVParser parser = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build().parse(reader);
            List<List<String>> batchRows = new ArrayList<>();

            long totalRows = 0;

            for (CSVRecord record : parser) {
                List<String> row = new ArrayList<>();

                for (int i = 0; i < columns.size(); i++) {
                    row.add(record.get(i));
                }

                batchRows.add(row);
                totalRows++;

                if (batchRows.size() >= 1000) {
                    tableService.batchInsertRows( tableName, columns, batchRows );
                    batchRows.clear();
                }
            }

            if (!batchRows.isEmpty()) {
                tableService.batchInsertRows( tableName, columns, batchRows );
            }

            return totalRows;

        } catch (Exception e) {

            throw new RuntimeException("Failed to process CSV", e );
        }
    }
}
