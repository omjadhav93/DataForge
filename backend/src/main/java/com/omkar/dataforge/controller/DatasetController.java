package com.omkar.dataforge.controller;

import com.omkar.dataforge.dto.PaginatedResponseDto;
import com.omkar.dataforge.dto.UploadResponseDto;
import com.omkar.dataforge.service.DatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
@RequiredArgsConstructor
public class DatasetController {

    private final DatasetService datasetService;

    @PostMapping(value = "/upload")
    public ResponseEntity<UploadResponseDto> uploadCsv( @RequestParam("file") MultipartFile file ) {

        UploadResponseDto response = datasetService.uploadDataset(file);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{tableName}/rows")
    public ResponseEntity<PaginatedResponseDto> getRows(

            @PathVariable String tableName,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "50")
            int size,

            @RequestParam(required = false)
            String search,

            @RequestParam(defaultValue = "id")
            String sortBy,

            @RequestParam(defaultValue = "asc")
            String sortDir,

            @RequestParam Map<String, String> allParams
    ) {

        PaginatedResponseDto response = datasetService.getDatasetRows( tableName, page, size, search, sortBy, sortDir, allParams );

        return ResponseEntity.ok(response);
    }
}
