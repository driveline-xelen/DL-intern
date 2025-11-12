package com.expense.app.dto;

import com.expense.app.model.ExpenseItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseItemResponse {
    private Integer id;
    private LocalDate date;
    private String category;
    private String description;
    private BigDecimal amount;
    private String receiptUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ExpenseItemResponse fromExpenseItem(ExpenseItem item) {
        ExpenseItemResponse response = new ExpenseItemResponse();
        response.setId(item.getId());
        response.setDate(item.getDate());
        response.setCategory(item.getCategory());
        response.setDescription(item.getDescription());
        response.setAmount(item.getAmount());
        response.setReceiptUrl(item.getReceiptUrl());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }
}
