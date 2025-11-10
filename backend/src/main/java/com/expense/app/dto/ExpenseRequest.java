package com.expense.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseRequest {
    private String title;
    private String description;
    private String status; // draft or pending
    private ExpenseItemRequest item; // Single item for simplified UI
}
