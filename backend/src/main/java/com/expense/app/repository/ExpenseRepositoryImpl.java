package com.expense.app.repository;

import com.expense.app.model.Expense;
import com.expense.app.repository.mapper.ExpenseRowMapper;
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
public class ExpenseRepositoryImpl implements ExpenseRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ExpenseRowMapper expenseRowMapper = new ExpenseRowMapper();

    public ExpenseRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId) {
        String sql = "SELECT e.id, e.user_id, e.title, e.description, e.total_amount, e.status, " +
                    "e.submission_date, e.approval_date, e.approver_id, e.rejection_reason, e.created_at, e.updated_at, " +
                    "u.username, u.full_name as user_full_name, u.department as user_department " +
                    "FROM expenses e " +
                    "JOIN users u ON e.user_id = u.id " +
                    "WHERE e.user_id = ? " +
                    "ORDER BY e.created_at DESC";
        return jdbcTemplate.query(sql, expenseRowMapper, userId);
    }

    @Override
    public List<Expense> findByStatusOrderByCreatedAtDesc(String status) {
        String sql = "SELECT e.id, e.user_id, e.title, e.description, e.total_amount, e.status, " +
                    "e.submission_date, e.approval_date, e.approver_id, e.rejection_reason, e.created_at, e.updated_at, " +
                    "u.username, u.full_name as user_full_name, u.department as user_department " +
                    "FROM expenses e " +
                    "JOIN users u ON e.user_id = u.id " +
                    "WHERE e.status = ? " +
                    "ORDER BY e.created_at DESC";
        return jdbcTemplate.query(sql, expenseRowMapper, status);
    }

    @Override
    public List<Expense> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status) {
        String sql = "SELECT e.id, e.user_id, e.title, e.description, e.total_amount, e.status, " +
                    "e.submission_date, e.approval_date, e.approver_id, e.rejection_reason, e.created_at, e.updated_at, " +
                    "u.username, u.full_name as user_full_name, u.department as user_department " +
                    "FROM expenses e " +
                    "JOIN users u ON e.user_id = u.id " +
                    "WHERE e.user_id = ? AND e.status = ? " +
                    "ORDER BY e.created_at DESC";
        return jdbcTemplate.query(sql, expenseRowMapper, userId, status);
    }

    @Override
    public Expense save(Expense expense) {
        LocalDateTime now = LocalDateTime.now();

        if (expense.getId() == null) {
            // Insert new expense
            String sql = "INSERT INTO expenses (user_id, title, description, total_amount, status, " +
                        "submission_date, approval_date, approver_id, rejection_reason, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
                ps.setLong(1, expense.getUserId());
                ps.setString(2, expense.getTitle());
                ps.setString(3, expense.getDescription());
                ps.setBigDecimal(4, expense.getTotalAmount());
                ps.setString(5, expense.getStatus() != null ? expense.getStatus() : "draft");
                ps.setDate(6, expense.getSubmissionDate() != null ? Date.valueOf(expense.getSubmissionDate()) : null);
                ps.setDate(7, expense.getApprovalDate() != null ? Date.valueOf(expense.getApprovalDate()) : null);

                if (expense.getApproverId() != null) {
                    ps.setLong(8, expense.getApproverId());
                } else {
                    ps.setNull(8, java.sql.Types.BIGINT);
                }

                ps.setString(9, expense.getRejectionReason());
                ps.setTimestamp(10, Timestamp.valueOf(now));
                ps.setTimestamp(11, Timestamp.valueOf(now));
                return ps;
            }, keyHolder);

            expense.setId(((Number) keyHolder.getKeys().get("id")).intValue());
            expense.setCreatedAt(now);
            expense.setUpdatedAt(now);
        } else {
            // Update existing expense
            String sql = "UPDATE expenses SET user_id = ?, title = ?, description = ?, total_amount = ?, " +
                        "status = ?, submission_date = ?, approval_date = ?, approver_id = ?, rejection_reason = ?, updated_at = ? " +
                        "WHERE id = ?";

            jdbcTemplate.update(sql,
                expense.getUserId(),
                expense.getTitle(),
                expense.getDescription(),
                expense.getTotalAmount(),
                expense.getStatus(),
                expense.getSubmissionDate() != null ? Date.valueOf(expense.getSubmissionDate()) : null,
                expense.getApprovalDate() != null ? Date.valueOf(expense.getApprovalDate()) : null,
                expense.getApproverId(),
                expense.getRejectionReason(),
                Timestamp.valueOf(now),
                expense.getId()
            );
            expense.setUpdatedAt(now);
        }

        return expense;
    }

    @Override
    public Optional<Expense> findById(Integer id) {
        String sql = "SELECT e.id, e.user_id, e.title, e.description, e.total_amount, e.status, " +
                    "e.submission_date, e.approval_date, e.approver_id, e.rejection_reason, e.created_at, e.updated_at, " +
                    "u.username, u.full_name as user_full_name, u.department as user_department, " +
                    "a.username as approver_username, a.full_name as approver_full_name " +
                    "FROM expenses e " +
                    "JOIN users u ON e.user_id = u.id " +
                    "LEFT JOIN users a ON e.approver_id = a.id " +
                    "WHERE e.id = ?";
        try {
            Expense expense = jdbcTemplate.queryForObject(sql, expenseRowMapper, id);
            return Optional.ofNullable(expense);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Expense> findAll() {
        String sql = "SELECT e.id, e.user_id, e.title, e.description, e.total_amount, e.status, " +
                    "e.submission_date, e.approval_date, e.approver_id, e.rejection_reason, e.created_at, e.updated_at, " +
                    "u.username, u.full_name as user_full_name, u.department as user_department " +
                    "FROM expenses e " +
                    "JOIN users u ON e.user_id = u.id " +
                    "ORDER BY e.created_at DESC";
        return jdbcTemplate.query(sql, expenseRowMapper);
    }

    @Override
    public void delete(Expense expense) {
        String sql = "DELETE FROM expenses WHERE id = ?";
        jdbcTemplate.update(sql, expense.getId());
    }

    @Override
    public void deleteById(Integer id) {
        String sql = "DELETE FROM expenses WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
