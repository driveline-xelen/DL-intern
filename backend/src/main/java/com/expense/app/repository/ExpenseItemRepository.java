package com.expense.app.repository;

import com.expense.app.model.ExpenseItem;

import java.util.List;
import java.util.Optional;

public interface ExpenseItemRepository {
    List<ExpenseItem> findByExpenseId(Integer expenseId);
    ExpenseItem save(ExpenseItem item);
    Optional<ExpenseItem> findById(Integer id);
    List<ExpenseItem> findAll();
    void delete(ExpenseItem item);
    void deleteById(Integer id);
    void deleteAll(List<ExpenseItem> items);
}
