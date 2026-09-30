package com.banking.service;

import com.banking.dto.AuthResponse;
import com.banking.dto.LoginRequest;
import com.banking.dto.RegisterRequest;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.exception.AccountFrozenException;
import com.banking.exception.DuplicateResourceException;
import com.banking.exception.InvalidCredentialsException;
import com.banking.repository.UserRepository;
import com.banking.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil);
    }

    @Test
    void register_withExistingEmail_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("taken@example.com");
        request.setFullName("Someone");
        request.setPassword("password123");
        request.setPhoneNumber("9876543210");

        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void register_withExistingPhone_throws() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setFullName("Someone");
        request.setPassword("password123");
        request.setPhoneNumber("9876543210");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhoneNumber("9876543210")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void register_success_returnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setFullName("New User");
        request.setPassword("password123");
        request.setPhoneNumber("9876543210");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhoneNumber(any())).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(jwtUtil.generateToken(eq("new@example.com"), eq("CUSTOMER"))).thenReturn("a.jwt.token");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("a.jwt.token");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");
        verify(userRepository).save(argThat(u -> u.getPassword().equals("hashed")));
    }

    @Test
    void login_withWrongPassword_throwsInvalidCredentials() {
        User user = User.builder()
                .email("jane@example.com")
                .password("hashed")
                .isActive(true)
                .role(Role.CUSTOMER)
                .build();
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void login_forSuspendedUser_throwsAccountFrozen() {
        User user = User.builder()
                .email("jane@example.com")
                .password("hashed")
                .isActive(false)
                .role(Role.CUSTOMER)
                .build();
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("whatever");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(AccountFrozenException.class);
    }

    @Test
    void login_success_returnsToken() {
        User user = User.builder()
                .email("jane@example.com")
                .password("hashed")
                .isActive(true)
                .role(Role.CUSTOMER)
                .fullName("Jane Doe")
                .build();
        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken("jane@example.com", "CUSTOMER")).thenReturn("a.jwt.token");

        LoginRequest request = new LoginRequest();
        request.setEmail("jane@example.com");
        request.setPassword("correct");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("a.jwt.token");
    }
}
