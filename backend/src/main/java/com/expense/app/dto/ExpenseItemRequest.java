package com.expense.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseItemRequest {
    private LocalDate date;
    private String category;
    private String description;
    private BigDecimal amount;
    private String receiptUrl;
}
