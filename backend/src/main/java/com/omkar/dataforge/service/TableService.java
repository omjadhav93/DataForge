package com.omkar.dataforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import com.omkar.dataforge.dto.PaginatedResponseDto;
import org.springframework.jdbc.core.ColumnMapRowMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TableService {

    private final JdbcTemplate jdbcTemplate;

    public void createDynamicTable( String tableName, List<String> columns ) {

        StringBuilder sql = new StringBuilder();

        sql.append("CREATE TABLE ").append(tableName).append(" (");
        sql.append("id BIGSERIAL PRIMARY KEY,");

        for (String column : columns) {
            sql.append(column).append(" TEXT,");
        }
        sql.deleteCharAt(sql.length() - 1);
        sql.append(")");

        jdbcTemplate.execute(sql.toString());
    }

    public void batchInsertRows( String tableName, List<String> columns, List<List<String>> rows ) {

        StringBuilder sql = new StringBuilder();

        sql.append("INSERT INTO ").append(tableName).append(" (");
        sql.append(String.join(",", columns));
        sql.append(") VALUES (");
        sql.append(String.join( ",", columns.stream().map(col -> "?").toList() ));
        sql.append(")");

        jdbcTemplate.batchUpdate(sql.toString(), rows, 1000, 
                (ps, row) -> {
                        for (int i = 0; i < row.size(); i++) {         
                                ps.setString(i + 1, row.get(i));     
                        } 
                }
        );
    }

    public PaginatedResponseDto fetchRows( String tableName, int page, int size, String search, String sortBy, String sortDir, List<String> filterColumns, List<String> filterValues, List<String> filterConjunctions, Map<String, String> allParams ) {

        validateSqlIdentifier(tableName);
        validateSqlIdentifier(sortBy);

        int offset = page * size;

        StringBuilder sql = new StringBuilder( "SELECT * FROM " + tableName + " WHERE 1=1 " );
        StringBuilder countSql = new StringBuilder("SELECT COUNT(*) FROM " + tableName + " WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {

            sql.append("AND CAST(").append(sortBy).append(" AS TEXT) ILIKE ? ");
            countSql.append("AND CAST(").append(sortBy).append(" AS TEXT) ILIKE ? ");
            params.add("%" + search + "%");
        }

        for (Map.Entry<String, String> entry : allParams.entrySet()) {
            String key = entry.getKey();
            if ( List.of( "page", "size", "search", "sortBy", "sortDir", "filterColumn", "filterValue", "filterConjunction" ).contains(key) ) continue;

            validateSqlIdentifier(key);
            sql.append("AND ").append(key).append(" = ? ");
            countSql.append("AND ").append(key).append(" = ? ");
            params.add(entry.getValue());
        }

        appendBuilderFilters(sql, countSql, params, filterColumns, filterValues, filterConjunctions);

        sql.append("ORDER BY ").append(sortBy).append(" ");

        if ( sortDir.equalsIgnoreCase("desc") ) {
            sql.append("DESC ");
        } else {
            sql.append("ASC ");
        }

        sql.append("LIMIT ? OFFSET ?");

        List<Object> queryParams = new ArrayList<>(params);

        queryParams.add(size);
        queryParams.add(offset);

        List<Map<String, Object>> rows = jdbcTemplate.query( sql.toString(), queryParams.toArray(), new ColumnMapRowMapper() );
        long totalRows = jdbcTemplate.queryForObject( countSql.toString(), params.toArray(), Long.class );
        int totalPages = (int) Math.ceil((double) totalRows / size);

        return PaginatedResponseDto.builder().data(rows).totalRows(totalRows).page(page).size(size).totalPages(totalPages).build();
    }

    private void appendBuilderFilters(
            StringBuilder sql,
            StringBuilder countSql,
            List<Object> params,
            List<String> filterColumns,
            List<String> filterValues,
            List<String> filterConjunctions
    ) {
        if ( filterColumns == null || filterValues == null || filterColumns.isEmpty() || filterValues.isEmpty() ) {
            return;
        }

        int filterCount = Math.min(filterColumns.size(), filterValues.size());
        String filterExpression = null;
        List<Object> filterParams = new ArrayList<>();

        for (int i = 0; i < filterCount; i++) {
            String column = filterColumns.get(i);
            String value = filterValues.get(i);

            if ( value == null || value.isBlank() ) {
                continue;
            }

            validateSqlIdentifier(column);

            String clause = column + " = ?";
            if ( filterExpression == null ) {
                filterExpression = clause;
            } else {
                String conjunction = "AND";
                if ( filterConjunctions != null && i < filterConjunctions.size() ) {
                    conjunction = normalizeConjunction(filterConjunctions.get(i));
                }

                filterExpression = "(" + filterExpression + " " + conjunction + " " + clause + ")";
            }

            filterParams.add(value);
        }

        if ( filterExpression == null ) {
            return;
        }

        String filterSql = "AND (" + filterExpression + ") ";
        sql.append(filterSql);
        countSql.append(filterSql);
        params.addAll(filterParams);
    }

    private String normalizeConjunction(String conjunction) {
        if ( "OR".equalsIgnoreCase(conjunction) ) {
            return "OR";
        }

        return "AND";
    }

    private void validateSqlIdentifier(String input) {
        if ( input == null || !input.matches("[a-zA-Z0-9_]+") ) {
                throw new RuntimeException("Invalid SQL identifier");
        }
    }
}



