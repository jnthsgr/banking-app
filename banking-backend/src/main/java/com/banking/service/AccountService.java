package com.banking.service;

import com.banking.dto.AccountRequestDTO;
import com.banking.dto.AccountResponseDTO;
import com.banking.entity.*;
import com.banking.exception.ForbiddenOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateAccountNumber() {
        String number;
        do {
            number = String.valueOf(1000000000L +
                    (long) (new Random().nextDouble() * 9000000000L));
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }

    private AccountResponseDTO mapToDTO(Account account) {
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

    public AccountResponseDTO createAccount(AccountRequestDTO request) {
        User user = getCurrentUser();

        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(request.getAccountType())
                .balance(BigDecimal.ZERO.setScale(2))
                .status(AccountStatus.ACTIVE)
                .user(user)
                .build();

        accountRepository.save(account);
        return mapToDTO(account);
    }

    public List<AccountResponseDTO> getMyAccounts() {
        User user = getCurrentUser();
        return accountRepository.findByUser(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public AccountResponseDTO getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        User currentUser = getCurrentUser();
        if (!account.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenOperationException("You do not have access to this account");
        }

        return mapToDTO(account);
    }
}