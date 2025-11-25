package com.expense.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    private Integer id;
    private Long userId;
    private String title;
    private String description;
    private BigDecimal totalAmount;
    private String status; // draft, pending, approved, rejected
    private LocalDate submissionDate;
    private LocalDate approvalDate;
    private Long approverId;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // For joined user information (optional, used when fetching with user details)
    private String username;
    private String userFullName;
    private String userDepartment;
    private String approverUsername;
    private String approverFullName;
}
