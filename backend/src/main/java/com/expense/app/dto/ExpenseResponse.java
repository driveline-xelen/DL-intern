package com.expense.app.dto;

import com.expense.app.model.Expense;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Integer id;
    private Long userId;
    private String userName;
    private String userDepartment;
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
    private List<ExpenseItemResponse> items;

    public static ExpenseResponse fromExpense(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setUserId(expense.getUserId());
        response.setUserName(expense.getUserFullName());
        response.setUserDepartment(expense.getUserDepartment());
        response.setTitle(expense.getTitle());
        response.setDescription(expense.getDescription());
        response.setTotalAmount(expense.getTotalAmount());
        response.setStatus(expense.getStatus());
        response.setSubmissionDate(expense.getSubmissionDate());
        response.setApprovalDate(expense.getApprovalDate());
        if (expense.getApproverId() != null) {
            response.setApproverId(expense.getApproverId());
            response.setApproverName(expense.getApproverFullName());
        }
        response.setCreatedAt(expense.getCreatedAt());
        response.setUpdatedAt(expense.getUpdatedAt());
        return response;
    }
}
