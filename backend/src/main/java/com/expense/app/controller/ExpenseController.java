package com.expense.app.controller;

import com.expense.app.dto.ExpenseRequest;
import com.expense.app.dto.ExpenseResponse;
import com.expense.app.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> createExpense(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ExpenseRequest request) {
        try {
            ExpenseResponse response = expenseService.createExpense(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @PathVariable Integer expenseId,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ExpenseRequest request) {
        try {
            ExpenseResponse response = expenseService.updateExpense(expenseId, userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpense(
            @PathVariable Integer expenseId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            ExpenseResponse response = expenseService.getExpense(expenseId, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> getUserExpenses(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String status) {
        try {
            List<ExpenseResponse> expenses;
            if (status != null && !status.isEmpty()) {
                expenses = expenseService.getUserExpensesByStatus(userId, status);
            } else {
                expenses = expenseService.getUserExpenses(userId);
            }
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingExpenses() {
        try {
            List<ExpenseResponse> expenses = expenseService.getPendingExpenses();
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @PathVariable Integer expenseId,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            expenseService.deleteExpense(expenseId, userId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Expense deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
