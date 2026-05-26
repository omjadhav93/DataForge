package com.omkar.dataforge.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "datasets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatasetMetadata {

    @Id
    private UUID id;
    private String originalFileName;
    private String tableName;
    private Long rowCount;
    private LocalDateTime uploadedAt;
    private LocalDateTime lastAccessedAt;
}