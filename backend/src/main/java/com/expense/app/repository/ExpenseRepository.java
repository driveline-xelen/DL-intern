package com.expense.app.repository;

import com.expense.app.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Expense> findByStatusOrderByCreatedAtDesc(String status);
    List<Expense> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
}
