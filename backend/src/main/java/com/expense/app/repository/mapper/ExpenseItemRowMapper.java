package com.expense.app.repository.mapper;

import com.expense.app.model.ExpenseItem;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class ExpenseItemRowMapper implements RowMapper<ExpenseItem> {
    @Override
    public ExpenseItem mapRow(ResultSet rs, int rowNum) throws SQLException {
        ExpenseItem item = new ExpenseItem();
        item.setId(rs.getInt("id"));
        item.setExpenseId(rs.getInt("expense_id"));
        item.setDate(rs.getDate("date").toLocalDate());
        item.setCategory(rs.getString("category"));
        item.setDescription(rs.getString("description"));
        item.setAmount(rs.getBigDecimal("amount"));
        item.setReceiptUrl(rs.getString("receipt_url"));
        item.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        if (rs.getTimestamp("updated_at") != null) {
            item.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        }

        return item;
    }
}
