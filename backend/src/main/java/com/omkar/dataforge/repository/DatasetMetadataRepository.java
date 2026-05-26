package com.omkar.dataforge.repository;

import com.omkar.dataforge.entity.DatasetMetadata;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DatasetMetadataRepository extends JpaRepository<DatasetMetadata, UUID> {

    List<DatasetMetadata>
    findByLastAccessedAtBefore(LocalDateTime time);

    Optional<DatasetMetadata> findByTableName(String tableName);
}
