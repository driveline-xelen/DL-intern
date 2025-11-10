package com.expense.app.service;

import com.expense.app.dto.LoginRequest;
import com.expense.app.dto.LoginResponse;
import com.expense.app.model.User;
import com.expense.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public LoginResponse login(LoginRequest request) {
        Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();

        // 簡易的なパスワードチェック（本番環境ではBCryptなどでハッシュ化が必要）
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new LoginResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getDepartment(),
            user.getRole()
        );
    }
}
