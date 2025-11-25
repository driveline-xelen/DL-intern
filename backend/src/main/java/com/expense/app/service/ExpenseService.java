package com.expense.app.service;

import com.expense.app.dto.ExpenseItemResponse;
import com.expense.app.dto.ExpenseRequest;
import com.expense.app.dto.ExpenseResponse;
import com.expense.app.model.Expense;
import com.expense.app.model.ExpenseItem;
import com.expense.app.repository.ExpenseRepository;
import com.expense.app.repository.ExpenseItemRepository;
import com.expense.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseItemRepository expenseItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());

        // Set status: either draft or pending
        String status = request.getStatus();
        if (status != null && (status.equals("draft") || status.equals("pending"))) {
            expense.setStatus(status);
            if (status.equals("pending")) {
                expense.setSubmissionDate(LocalDate.now());
            }
        } else {
            expense.setStatus("draft");
        }

        // Set total amount from item
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (request.getItem() != null && request.getItem().getAmount() != null) {
            totalAmount = request.getItem().getAmount();
        }
        expense.setTotalAmount(totalAmount);

        Expense savedExpense = expenseRepository.save(expense);

        // Save expense item if provided
        if (request.getItem() != null) {
            ExpenseItem item = new ExpenseItem();
            item.setExpenseId(savedExpense.getId());
            item.setDate(request.getItem().getDate());
            item.setCategory(request.getItem().getCategory());
            item.setDescription(request.getItem().getDescription());
            item.setAmount(request.getItem().getAmount());
            item.setReceiptUrl(request.getItem().getReceiptUrl());
            expenseItemRepository.save(item);
        }

        return ExpenseResponse.fromExpense(savedExpense);
    }

    @Transactional
    public ExpenseResponse updateExpense(Integer expenseId, Long userId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this expense");
        }

        if (!expense.getStatus().equals("draft") && !expense.getStatus().equals("pending")) {
            throw new RuntimeException("Cannot update expense with status: " + expense.getStatus());
        }

        expense.setTitle(request.getTitle());
        expense.setDescription(request.getDescription());

        String status = request.getStatus();
        if (status != null && (status.equals("draft") || status.equals("pending"))) {
            expense.setStatus(status);
            if (status.equals("pending") && expense.getSubmissionDate() == null) {
                expense.setSubmissionDate(LocalDate.now());
            }
        }

        // Update item and recalculate total
        if (request.getItem() != null) {
            // Delete existing items
            List<ExpenseItem> existingItems = expenseItemRepository.findByExpenseId(expenseId);
            expenseItemRepository.deleteAll(existingItems);

            // Add new item
            ExpenseItem item = new ExpenseItem();
            item.setExpenseId(expenseId);
            item.setDate(request.getItem().getDate());
            item.setCategory(request.getItem().getCategory());
            item.setDescription(request.getItem().getDescription());
            item.setAmount(request.getItem().getAmount());
            item.setReceiptUrl(request.getItem().getReceiptUrl());
            expenseItemRepository.save(item);
            expense.setTotalAmount(request.getItem().getAmount());
        }

        Expense updatedExpense = expenseRepository.save(expense);
        return ExpenseResponse.fromExpense(updatedExpense);
    }

    public ExpenseResponse getExpense(Integer expenseId, Long userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to view this expense");
        }

        ExpenseResponse response = ExpenseResponse.fromExpense(expense);

        // Add expense items
        List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expenseId);
        response.setItems(items.stream()
                .map(item -> {
                    ExpenseItemResponse itemResponse = new ExpenseItemResponse();
                    itemResponse.setId(item.getId());
                    itemResponse.setDate(item.getDate());
                    itemResponse.setCategory(item.getCategory());
                    itemResponse.setDescription(item.getDescription());
                    itemResponse.setAmount(item.getAmount());
                    itemResponse.setReceiptUrl(item.getReceiptUrl());
                    itemResponse.setCreatedAt(item.getCreatedAt());
                    itemResponse.setUpdatedAt(item.getUpdatedAt());
                    return itemResponse;
                })
                .collect(Collectors.toList()));

        return response;
    }

    public List<ExpenseResponse> getUserExpenses(Long userId) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return expenses.stream()
                .map(ExpenseResponse::fromExpense)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getUserExpensesByStatus(Long userId, String status) {
        List<Expense> expenses = expenseRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        return expenses.stream()
                .map(ExpenseResponse::fromExpense)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getPendingExpenses() {
        List<Expense> expenses = expenseRepository.findByStatusOrderByCreatedAtDesc("pending");
        return expenses.stream()
                .map(expense -> {
                    ExpenseResponse response = ExpenseResponse.fromExpense(expense);
                    // Add expense items
                    List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expense.getId());
                    response.setItems(items.stream()
                            .map(ExpenseItemResponse::fromExpenseItem)
                            .collect(Collectors.toList()));
                    return response;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse approveExpense(Integer expenseId, Long approverId) {
        // Get expense
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Check status
        if (!"pending".equals(expense.getStatus())) {
            throw new RuntimeException("この申請は既に処理済みです");
        }

        // Update expense
        expense.setStatus("approved");
        expense.setApprovalDate(LocalDate.now());
        expense.setApproverId(approverId);

        expenseRepository.save(expense);

        // Get updated expense with user details
        Expense updatedExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        ExpenseResponse response = ExpenseResponse.fromExpense(updatedExpense);

        // Add expense items
        List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expenseId);
        response.setItems(items.stream()
                .map(ExpenseItemResponse::fromExpenseItem)
                .collect(Collectors.toList()));

        return response;
    }

    @Transactional
    public ExpenseResponse rejectExpense(Integer expenseId, Long approverId, String reason) {
        // Get expense
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Check status
        if (!"pending".equals(expense.getStatus())) {
            throw new RuntimeException("この申請は既に処理済みです");
        }

        // Update expense
        expense.setStatus("rejected");
        expense.setApprovalDate(LocalDate.now());
        expense.setApproverId(approverId);
        expense.setRejectionReason(reason);

        expenseRepository.save(expense);

        // Get updated expense with user details
        Expense updatedExpense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        ExpenseResponse response = ExpenseResponse.fromExpense(updatedExpense);

        // Add expense items
        List<ExpenseItem> items = expenseItemRepository.findByExpenseId(expenseId);
        response.setItems(items.stream()
                .map(ExpenseItemResponse::fromExpenseItem)
                .collect(Collectors.toList()));

        return response;
    }

    @Transactional
    public void deleteExpense(Integer expenseId, Long userId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this expense");
        }

        if (!expense.getStatus().equals("draft")) {
            throw new RuntimeException("Can only delete draft expenses");
        }

        expenseRepository.delete(expense);
    }
}
