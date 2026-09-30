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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    private TransactionService transactionService;

    private User owner;
    private Account account;

    @BeforeEach
    void setUp() {
        transactionService = new TransactionService(transactionRepository, accountRepository, userRepository);

        owner = User.builder().id(1L).fullName("Jane Doe").email("jane@example.com").build();

        account = Account.builder()
                .id(10L)
                .accountNumber("1111111111")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("500.00"))
                .status(AccountStatus.ACTIVE)
                .user(owner)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(owner.getEmail(), null));
        lenientStub();
    }

    private void lenientStub() {
        lenient().when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        lenient().when(accountRepository.findByAccountNumber(account.getAccountNumber())).thenReturn(Optional.of(account));
        lenient().when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(99L);
            return t;
        });
    }

    @Test
    void deposit_increasesBalanceAndRecordsTransaction() {
        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("250.00"));

        TransactionResponseDTO result = transactionService.deposit(request);

        assertThat(account.getBalance()).isEqualByComparingTo("750.00");
        assertThat(result.getTransactionType()).isEqualTo(TransactionType.DEPOSIT);
        assertThat(result.getBalanceAfter()).isEqualByComparingTo("750.00");
    }

    @Test
    void withdraw_withInsufficientFunds_throws() {
        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("1000.00"));

        assertThatThrownBy(() -> transactionService.withdraw(request))
                .isInstanceOf(InsufficientFundsException.class);

        // Balance must be untouched when the withdrawal is rejected.
        assertThat(account.getBalance()).isEqualByComparingTo("500.00");
    }

    @Test
    void withdraw_withSufficientFunds_decreasesBalance() {
        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("200.00"));

        TransactionResponseDTO result = transactionService.withdraw(request);

        assertThat(account.getBalance()).isEqualByComparingTo("300.00");
        assertThat(result.getTransactionType()).isEqualTo(TransactionType.WITHDRAWAL);
    }

    @Test
    void deposit_intoFrozenAccount_throws() {
        account.setStatus(AccountStatus.FROZEN);

        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("10.00"));

        assertThatThrownBy(() -> transactionService.deposit(request))
                .isInstanceOf(AccountFrozenException.class);
    }

    @Test
    void transfer_toSameAccount_throws() {
        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setTargetAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("50.00"));

        assertThatThrownBy(() -> transactionService.transfer(request))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void transfer_toFrozenTarget_throws() {
        Account target = Account.builder()
                .id(20L)
                .accountNumber("2222222222")
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.FROZEN)
                .user(owner)
                .build();
        when(accountRepository.findByAccountNumber(target.getAccountNumber())).thenReturn(Optional.of(target));

        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setTargetAccountNumber(target.getAccountNumber());
        request.setAmount(new BigDecimal("50.00"));

        assertThatThrownBy(() -> transactionService.transfer(request))
                .isInstanceOf(AccountFrozenException.class);
    }

    @Test
    void transfer_movesFundsBetweenAccounts() {
        Account target = Account.builder()
                .id(20L)
                .accountNumber("2222222222")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("100.00"))
                .status(AccountStatus.ACTIVE)
                .user(owner)
                .build();
        when(accountRepository.findByAccountNumber(target.getAccountNumber())).thenReturn(Optional.of(target));

        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setTargetAccountNumber(target.getAccountNumber());
        request.setAmount(new BigDecimal("150.00"));

        TransactionResponseDTO result = transactionService.transfer(request);

        assertThat(account.getBalance()).isEqualByComparingTo("350.00");
        assertThat(target.getBalance()).isEqualByComparingTo("250.00");
        assertThat(result.getTransactionType()).isEqualTo(TransactionType.TRANSFER_CREDIT);
    }

    @Test
    void transfer_targetAccountNotFound_throws() {
        when(accountRepository.findByAccountNumber("9999999999")).thenReturn(Optional.empty());

        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setTargetAccountNumber("9999999999");
        request.setAmount(new BigDecimal("10.00"));

        assertThatThrownBy(() -> transactionService.transfer(request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void accessingAnotherUsersAccount_throwsForbidden() {
        User someoneElse = User.builder().id(2L).email("other@example.com").build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(someoneElse.getEmail(), null));
        when(userRepository.findByEmail(someoneElse.getEmail())).thenReturn(Optional.of(someoneElse));

        TransactionRequestDTO request = new TransactionRequestDTO();
        request.setAccountNumber(account.getAccountNumber());
        request.setAmount(new BigDecimal("10.00"));

        assertThatThrownBy(() -> transactionService.deposit(request))
                .isInstanceOf(ForbiddenOperationException.class);
    }
}
