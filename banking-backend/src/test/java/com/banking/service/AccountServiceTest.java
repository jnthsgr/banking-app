package com.banking.service;

import com.banking.dto.AccountRequestDTO;
import com.banking.dto.AccountResponseDTO;
import com.banking.entity.*;
import com.banking.exception.ForbiddenOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
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
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    private AccountService accountService;
    private User owner;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(accountRepository, userRepository);
        owner = User.builder().id(1L).fullName("Jane Doe").email("jane@example.com").build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(owner.getEmail(), null));
        lenient().when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        lenient().when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void createAccount_startsAtZeroBalanceAndActive() {
        AccountRequestDTO request = new AccountRequestDTO();
        request.setAccountType(AccountType.SAVINGS);
        lenient().when(accountRepository.existsByAccountNumber(any())).thenReturn(false);

        AccountResponseDTO result = accountService.createAccount(request);

        assertThat(result.getBalance()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(result.getAccountType()).isEqualTo(AccountType.SAVINGS);
    }

    @Test
    void getAccountByNumber_notOwnedByCaller_throwsForbidden() {
        User someoneElse = User.builder().id(2L).email("other@example.com").build();
        Account account = Account.builder()
                .accountNumber("1234567890")
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .user(someoneElse)
                .build();
        when(accountRepository.findByAccountNumber("1234567890")).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.getAccountByNumber("1234567890"))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void getAccountByNumber_notFound_throws() {
        when(accountRepository.findByAccountNumber("0000000000")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccountByNumber("0000000000"))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
