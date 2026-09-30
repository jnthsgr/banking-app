package com.banking.service;

import com.banking.dto.TransactionRequestDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.entity.*;
import com.banking.exception.AccountFrozenException;
import com.banking.exception.ForbiddenOperationException;
import com.banking.exception.InsufficientFundsException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Account getVerifiedAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        User currentUser = getCurrentUser();
        if (!account.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenOperationException("You do not have access to this account");
        }

        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("This account is frozen and cannot transact");
        }

        return account;
    }

    private TransactionResponseDTO mapToDTO(Transaction txn) {
        return TransactionResponseDTO.builder()
                .id(txn.getId())
                .amount(txn.getAmount())
                .transactionType(txn.getTransactionType())
                .balanceAfter(txn.getBalanceAfter())
                .description(txn.getDescription())
                .referenceNumber(txn.getReferenceNumber())
                .accountNumber(txn.getAccount().getAccountNumber())
                .createdAt(txn.getCreatedAt())
                .build();
    }

    private Transaction saveTransaction(Account account, Double amount,
                                        TransactionType type, Double balanceAfter,
                                        String description) {
        Transaction txn = Transaction.builder()
                .account(account)
                .amount(amount)
                .transactionType(type)
                .balanceAfter(balanceAfter)
                .description(description)
                .referenceNumber(UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();
        return transactionRepository.save(txn);
    }

    @Transactional
    public TransactionResponseDTO deposit(TransactionRequestDTO request) {
        Account account = getVerifiedAccount(request.getAccountNumber());

        account.setBalance(account.getBalance() + request.getAmount());
        accountRepository.save(account);

        Transaction txn = saveTransaction(
                account,
                request.getAmount(),
                TransactionType.DEPOSIT,
                account.getBalance(),
                request.getDescription() != null ? request.getDescription() : "Deposit"
        );

        return mapToDTO(txn);
    }

    @Transactional
    public TransactionResponseDTO withdraw(TransactionRequestDTO request) {
        Account account = getVerifiedAccount(request.getAccountNumber());

        if (account.getBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Insufficient balance for this withdrawal");
        }

        account.setBalance(account.getBalance() - request.getAmount());
        accountRepository.save(account);

        Transaction txn = saveTransaction(
                account,
                request.getAmount(),
                TransactionType.WITHDRAWAL,
                account.getBalance(),
                request.getDescription() != null ? request.getDescription() : "Withdrawal"
        );

        return mapToDTO(txn);
    }

    @Transactional
    public TransactionResponseDTO transfer(TransactionRequestDTO request) {

        Account source = getVerifiedAccount(request.getAccountNumber());

        Account target = accountRepository
                .findByAccountNumber(request.getTargetAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Target account not found"));

        if (target.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Target account is frozen and cannot receive funds");
        }

        if (source.getAccountNumber().equals(target.getAccountNumber())) {
            throw new ForbiddenOperationException("Cannot transfer to the same account");
        }

        if (source.getBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Insufficient balance for this transfer");
        }

        source.setBalance(source.getBalance() - request.getAmount());
        accountRepository.save(source);

        target.setBalance(target.getBalance() + request.getAmount());
        accountRepository.save(target);

        String desc = request.getDescription() != null
                ? request.getDescription()
                : "Transfer";

        saveTransaction(source, request.getAmount(),
                TransactionType.TRANSFER_DEBIT,
                source.getBalance(),
                desc + " to " + target.getAccountNumber());

        Transaction creditTxn = saveTransaction(target, request.getAmount(),
                TransactionType.TRANSFER_CREDIT,
                target.getBalance(),
                desc + " from " + source.getAccountNumber());

        return mapToDTO(creditTxn);
    }

    public List<TransactionResponseDTO> getHistory(String accountNumber) {
        Account account = getVerifiedAccount(accountNumber);
        return transactionRepository
                .findByAccountOrderByCreatedAtDesc(account)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<TransactionResponseDTO> getHistoryPaged(String accountNumber, Pageable pageable) {
        Account account = getVerifiedAccount(accountNumber);
        return transactionRepository
                .findByAccountOrderByCreatedAtDesc(account, pageable)
                .map(this::mapToDTO);
    }
}