package com.omkar.dataforge.job;

import com.omkar.dataforge.entity.DatasetMetadata;
import com.omkar.dataforge.repository.DatasetMetadataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatasetCleanupJob {

    private final DatasetMetadataRepository metadataRepository;

    private final JdbcTemplate jdbcTemplate;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupUnusedDatasets() {
        log.info("Running dataset cleanup job...");

        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<DatasetMetadata> oldDatasets = metadataRepository.findByLastAccessedAtBefore(threshold);

        for (DatasetMetadata dataset : oldDatasets) {
            String tableName = dataset.getTableName();

            try {
                validateSqlIdentifier(tableName);

                jdbcTemplate.execute("DROP TABLE IF EXISTS " + tableName);
                metadataRepository.delete(dataset);

                log.info("Deleted dataset: {}", tableName);
            } catch (Exception e) {
                log.error("Failed to delete dataset {}", tableName, e);
            }
        }
    }

    private void validateSqlIdentifier(String input) {
        if (input == null || !input.matches("[a-zA-Z0-9_]+")) {
            throw new IllegalArgumentException("Invalid SQL identifier");
        }
    }
}
