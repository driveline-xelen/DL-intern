package com.expense.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String role;
    private String message;

    public LoginResponse(Long id, String username, String email, String fullName,
                        String department, String role) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.department = department;
        this.role = role;
        this.message = "Login successful";
    }
}
