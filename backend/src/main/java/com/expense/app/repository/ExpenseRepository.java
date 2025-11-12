package com.expense.app.repository;

import com.expense.app.model.Expense;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository {
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Expense> findByStatusOrderByCreatedAtDesc(String status);
    List<Expense> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    Expense save(Expense expense);
    Optional<Expense> findById(Integer id);
    List<Expense> findAll();
    void delete(Expense expense);
    void deleteById(Integer id);
}
