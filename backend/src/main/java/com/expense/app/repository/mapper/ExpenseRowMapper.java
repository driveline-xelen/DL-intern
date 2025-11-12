package com.expense.app.repository.mapper;

import com.expense.app.model.Expense;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ExpenseRowMapper implements RowMapper<Expense> {
    @Override
    public Expense mapRow(ResultSet rs, int rowNum) throws SQLException {
        Expense expense = new Expense();
        expense.setId(rs.getInt("id"));
        expense.setUserId(rs.getLong("user_id"));
        expense.setTitle(rs.getString("title"));
        expense.setDescription(rs.getString("description"));
        expense.setTotalAmount(rs.getBigDecimal("total_amount"));
        expense.setStatus(rs.getString("status"));

        if (rs.getDate("submission_date") != null) {
            expense.setSubmissionDate(rs.getDate("submission_date").toLocalDate());
        }

        if (rs.getDate("approval_date") != null) {
            expense.setApprovalDate(rs.getDate("approval_date").toLocalDate());
        }

        if (rs.getObject("approver_id") != null) {
            expense.setApproverId(rs.getLong("approver_id"));
        }

        expense.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        if (rs.getTimestamp("updated_at") != null) {
            expense.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        // Try to get user information if available (for joined queries)
        try {
            String username = rs.getString("username");
            if (username != null) {
                expense.setUsername(username);
                expense.setUserFullName(rs.getString("user_full_name"));
                expense.setUserDepartment(rs.getString("user_department"));
            }
        } catch (SQLException e) {
            // Column doesn't exist, skip
        }

        try {
            String approverUsername = rs.getString("approver_username");
            if (approverUsername != null) {
                expense.setApproverUsername(approverUsername);
                expense.setApproverFullName(rs.getString("approver_full_name"));
            }
        } catch (SQLException e) {
            // Column doesn't exist, skip
        }

        return expense;
    }
}
