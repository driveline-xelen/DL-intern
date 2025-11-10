package com.expense.app.dto;

import com.expense.app.model.Expense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Integer id;
    private Long userId;
    private String userName;
    private String title;
    private String description;
    private BigDecimal totalAmount;
    private String status;
    private LocalDate submissionDate;
    private LocalDate approvalDate;
    private Long approverId;
    private String approverName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ExpenseResponse fromExpense(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setUserId(expense.getUser().getId());
        response.setUserName(expense.getUser().getFullName());
        response.setTitle(expense.getTitle());
        response.setDescription(expense.getDescription());
        response.setTotalAmount(expense.getTotalAmount());
        response.setStatus(expense.getStatus());
        response.setSubmissionDate(expense.getSubmissionDate());
        response.setApprovalDate(expense.getApprovalDate());
        if (expense.getApprover() != null) {
            response.setApproverId(expense.getApprover().getId());
            response.setApproverName(expense.getApprover().getFullName());
        }
        response.setCreatedAt(expense.getCreatedAt());
        response.setUpdatedAt(expense.getUpdatedAt());
        return response;
    }
}
