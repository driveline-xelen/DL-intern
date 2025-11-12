package com.expense.app.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String fullName;
    private String department;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
