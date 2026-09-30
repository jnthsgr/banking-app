package com.banking.service;

import com.banking.dto.LoanApplicationRequestDTO;
import com.banking.dto.LoanResponseDTO;
import com.banking.entity.*;
import com.banking.exception.ForbiddenOperationException;
import com.banking.repository.AccountRepository;
import com.banking.repository.LoanRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private UserRepository userRepository;

    private LoanService loanService;
    private User owner;
    private Account account;

    @BeforeEach
    void setUp() {
        loanService = new LoanService(loanRepository, accountRepository, transactionRepository, userRepository);
        owner = User.builder().id(1L).fullName("Jane Doe").email("jane@example.com").build();
        account = Account.builder()
                .id(10L)
                .accountNumber("1111111111")
                .balance(new BigDecimal("1000.00"))
                .status(AccountStatus.ACTIVE)
                .user(owner)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(owner.getEmail(), null));
        lenient().when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        lenient().when(accountRepository.findByAccountNumber(account.getAccountNumber())).thenReturn(Optional.of(account));
        lenient().when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
        lenient().when(loanRepository.save(any(Loan.class))).thenAnswer(inv -> {
            Loan l = inv.getArgument(0);
            l.setId(7L);
            return l;
        });
    }

    private LoanApplicationRequestDTO request(LoanType type, String amount, int tenure) {
        LoanApplicationRequestDTO r = new LoanApplicationRequestDTO();
        r.setLoanType(type);
        r.setAmount(new BigDecimal(amount));
        r.setTenureMonths(tenure);
        r.setAccountNumber(account.getAccountNumber());
        return r;
    }

    @Test
    void applyForLoan_exceedingMaxAmount_throws() {
        LoanApplicationRequestDTO request = request(LoanType.PERSONAL, "5000000", 12);

        assertThatThrownBy(() -> loanService.applyForLoan(request))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("exceeds the maximum");
    }

    @Test
    void applyForLoan_exceedingMaxTenure_throws() {
        LoanApplicationRequestDTO request = request(LoanType.PERSONAL, "10000", 999);

        assertThatThrownBy(() -> loanService.applyForLoan(request))
                .isInstanceOf(ForbiddenOperationException.class)
                .hasMessageContaining("Tenure exceeds");
    }

    @Test
    void applyForLoan_onFrozenAccount_throws() {
        account.setStatus(AccountStatus.FROZEN);
        LoanApplicationRequestDTO request = request(LoanType.PERSONAL, "10000", 12);

        assertThatThrownBy(() -> loanService.applyForLoan(request))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void applyForLoan_disbursesInstantlyAndLogsTransaction() {
        LoanApplicationRequestDTO request = request(LoanType.PERSONAL, "50000", 12);

        LoanResponseDTO result = loanService.applyForLoan(request);

        assertThat(result.getStatus()).isEqualTo(LoanStatus.APPROVED);
        assertThat(result.getMonthlyInstallment()).isPositive();
        assertThat(account.getBalance()).isEqualByComparingTo("51000.00");

        ArgumentCaptor<Transaction> captor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository).save(captor.capture());
        assertThat(captor.getValue().getTransactionType()).isEqualTo(TransactionType.LOAN_DISBURSEMENT);
        assertThat(captor.getValue().getAmount()).isEqualByComparingTo("50000");
    }
}
