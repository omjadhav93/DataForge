package com.omkar.dataforge.util;

import java.util.Set;

public class SqlSanitizerUtil {

    private static final Set<String> RESERVED_KEYWORDS = Set.of(
            "select",
            "table",
            "group",
            "order",
            "where",
            "from"
    );

    public static String sanitizeColumnName(String input) {

        String sanitized = input
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9_]", "_")
                .replaceAll("_+", "_");

        if (sanitized.isBlank()) {
            sanitized = "column_name";
        }

        if (Character.isDigit(sanitized.charAt(0))) {
            sanitized = "_" + sanitized;
        }

        if (RESERVED_KEYWORDS.contains(sanitized)) {
            sanitized = sanitized + "_col";
        }

        return sanitized;
    }
}