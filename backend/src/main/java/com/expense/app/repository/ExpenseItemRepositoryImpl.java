package com.expense.app.repository;

import com.expense.app.model.ExpenseItem;
import com.expense.app.repository.mapper.ExpenseItemRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class ExpenseItemRepositoryImpl implements ExpenseItemRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ExpenseItemRowMapper expenseItemRowMapper = new ExpenseItemRowMapper();

    public ExpenseItemRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<ExpenseItem> findByExpenseId(Integer expenseId) {
        String sql = "SELECT * FROM expense_items WHERE expense_id = ? ORDER BY date DESC";
        return jdbcTemplate.query(sql, expenseItemRowMapper, expenseId);
    }

    @Override
    public ExpenseItem save(ExpenseItem item) {
        LocalDateTime now = LocalDateTime.now();

        if (item.getId() == null) {
            // Insert new expense item
            String sql = "INSERT INTO expense_items (expense_id, date, category, description, amount, " +
                        "receipt_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
                ps.setInt(1, item.getExpenseId());
                ps.setDate(2, Date.valueOf(item.getDate()));
                ps.setString(3, item.getCategory());
                ps.setString(4, item.getDescription());
                ps.setBigDecimal(5, item.getAmount());
                ps.setString(6, item.getReceiptUrl());
                ps.setTimestamp(7, Timestamp.valueOf(now));
                ps.setTimestamp(8, Timestamp.valueOf(now));
                return ps;
            }, keyHolder);

            item.setId(((Number) keyHolder.getKeys().get("id")).intValue());
            item.setCreatedAt(now);
            item.setUpdatedAt(now);
        } else {
            // Update existing expense item
            String sql = "UPDATE expense_items SET expense_id = ?, date = ?, category = ?, description = ?, " +
                        "amount = ?, receipt_url = ?, updated_at = ? WHERE id = ?";

            jdbcTemplate.update(sql,
                item.getExpenseId(),
                Date.valueOf(item.getDate()),
                item.getCategory(),
                item.getDescription(),
                item.getAmount(),
                item.getReceiptUrl(),
                Timestamp.valueOf(now),
                item.getId()
            );
            item.setUpdatedAt(now);
        }

        return item;
    }

    @Override
    public Optional<ExpenseItem> findById(Integer id) {
        String sql = "SELECT * FROM expense_items WHERE id = ?";
        try {
            ExpenseItem item = jdbcTemplate.queryForObject(sql, expenseItemRowMapper, id);
            return Optional.ofNullable(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<ExpenseItem> findAll() {
        String sql = "SELECT * FROM expense_items ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, expenseItemRowMapper);
    }

    @Override
    public void delete(ExpenseItem item) {
        String sql = "DELETE FROM expense_items WHERE id = ?";
        jdbcTemplate.update(sql, item.getId());
    }

    @Override
    public void deleteById(Integer id) {
        String sql = "DELETE FROM expense_items WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    @Override
    public void deleteAll(List<ExpenseItem> items) {
        String sql = "DELETE FROM expense_items WHERE id = ?";
        List<Object[]> batchArgs = items.stream()
            .map(item -> new Object[]{item.getId()})
            .toList();
        jdbcTemplate.batchUpdate(sql, batchArgs);
    }
}
