package com.banking.service;

import com.banking.dto.AccountResponseDTO;
import com.banking.dto.AdminUserResponseDTO;
import com.banking.entity.Account;
import com.banking.entity.AccountStatus;
import com.banking.entity.User;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Back-office operations reserved for ROLE_ADMIN — customer and account
 * oversight that a retail banking platform's operations team needs.
 */
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public List<AdminUserResponseDTO> listUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUser)
                .collect(Collectors.toList());
    }

    public List<AccountResponseDTO> listAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapAccount)
                .collect(Collectors.toList());
    }

    public AccountResponseDTO setAccountStatus(String accountNumber, AccountStatus status) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));
        account.setStatus(status);
        accountRepository.save(account);
        return mapAccount(account);
    }

    private AdminUserResponseDTO mapUser(User user) {
        return AdminUserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AccountResponseDTO mapAccount(Account account) {
        return AccountResponseDTO.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .status(account.getStatus())
                .ownerName(account.getUser().getFullName())
                .ownerEmail(account.getUser().getEmail())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
