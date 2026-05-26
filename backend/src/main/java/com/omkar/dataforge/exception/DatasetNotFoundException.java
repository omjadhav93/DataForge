package com.omkar.dataforge.exception;

public class DatasetNotFoundException extends RuntimeException {

    public DatasetNotFoundException(String tableName) {
        super("Dataset not found for table: " + tableName);
    }
}
