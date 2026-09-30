package com.banking.service;

import com.banking.dto.LoanApplicationRequestDTO;
import com.banking.dto.LoanProductDTO;
import com.banking.dto.LoanResponseDTO;
import com.banking.entity.*;
import com.banking.exception.ForbiddenOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.LoanRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private static final List<LoanProductDTO> PRODUCT_CATALOG = List.of(
            LoanProductDTO.builder()
                    .loanType(LoanType.PERSONAL)
                    .displayName("Personal Loan")
                    .description("Unsecured funding for anything from a wedding to a medical emergency.")
                    .interestRateApr(11.5)
                    .maxAmount(new BigDecimal("1500000"))
                    .maxTenureMonths(60)
                    .build(),
            LoanProductDTO.builder()
                    .loanType(LoanType.HOME)
                    .displayName("Home Loan")
                    .description("Finance a new home or renovate your existing one at a low fixed rate.")
                    .interestRateApr(8.25)
                    .maxAmount(new BigDecimal("20000000"))
                    .maxTenureMonths(360)
                    .build(),
            LoanProductDTO.builder()
                    .loanType(LoanType.AUTO)
                    .displayName("Auto Loan")
                    .description("Drive away today with fast approval on new and used vehicles.")
                    .interestRateApr(9.75)
                    .maxAmount(new BigDecimal("2500000"))
                    .maxTenureMonths(84)
                    .build(),
            LoanProductDTO.builder()
                    .loanType(LoanType.EDUCATION)
                    .displayName("Education Loan")
                    .description("Invest in your future with flexible repayment after graduation.")
                    .interestRateApr(7.5)
                    .maxAmount(new BigDecimal("4000000"))
                    .maxTenureMonths(120)
                    .build()
    );

    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public List<LoanProductDTO> getProductCatalog() {
        return PRODUCT_CATALOG;
    }

    private LoanProductDTO findProduct(LoanType type) {
        return PRODUCT_CATALOG.stream()
                .filter(p -> p.getLoanType() == type)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Unknown loan product: " + type));
    }

    /**
     * EMI math is done in double precision (the compounding formula isn't exact
     * in BigDecimal without a fixed MathContext anyway) and only the final,
     * user-facing installment amount is rounded back to currency precision.
     */
    private BigDecimal monthlyInstallment(BigDecimal principal, double aprPercent, int months) {
        double principalValue = principal.doubleValue();
        double monthlyRate = aprPercent / 100.0 / 12.0;
        double emi;
        if (monthlyRate == 0) {
            emi = principalValue / months;
        } else {
            double factor = Math.pow(1 + monthlyRate, months);
            emi = principalValue * monthlyRate * factor / (factor - 1);
        }
        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public LoanResponseDTO applyForLoan(LoanApplicationRequestDTO request) {
        User user = getCurrentUser();
        LoanProductDTO product = findProduct(request.getLoanType());

        if (request.getAmount().compareTo(product.getMaxAmount()) > 0) {
            throw new ForbiddenOperationException(
                    "Amount exceeds the maximum of " + product.getMaxAmount() + " for " + product.getDisplayName());
        }
        if (request.getTenureMonths() > product.getMaxTenureMonths()) {
            throw new ForbiddenOperationException(
                    "Tenure exceeds the maximum of " + product.getMaxTenureMonths() + " months for " + product.getDisplayName());
        }

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You do not have access to this account");
        }
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new ForbiddenOperationException("Cannot disburse a loan into a frozen account");
        }

        Loan loan = Loan.builder()
                .loanType(request.getLoanType())
                .principalAmount(request.getAmount())
                .interestRateApr(product.getInterestRateApr())
                .tenureMonths(request.getTenureMonths())
                .status(LoanStatus.APPROVED)
                .user(user)
                .disbursementAccount(account)
                .build();
        loanRepository.save(loan);

        // Instant disbursement: credit the account and log the transaction, mirroring TransactionService.deposit.
        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        Transaction txn = Transaction.builder()
                .account(account)
                .amount(request.getAmount())
                .transactionType(TransactionType.LOAN_DISBURSEMENT)
                .balanceAfter(account.getBalance())
                .description(product.getDisplayName() + " disbursement")
                .referenceNumber(UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .build();
        transactionRepository.save(txn);

        return mapToDTO(loan);
    }

    public List<LoanResponseDTO> getMyLoans() {
        User user = getCurrentUser();
        return loanRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private LoanResponseDTO mapToDTO(Loan loan) {
        return LoanResponseDTO.builder()
                .id(loan.getId())
                .loanType(loan.getLoanType())
                .principalAmount(loan.getPrincipalAmount())
                .interestRateApr(loan.getInterestRateApr())
                .tenureMonths(loan.getTenureMonths())
                .monthlyInstallment(monthlyInstallment(loan.getPrincipalAmount(), loan.getInterestRateApr(), loan.getTenureMonths()))
                .status(loan.getStatus())
                .disbursementAccountNumber(loan.getDisbursementAccount().getAccountNumber())
                .createdAt(loan.getCreatedAt())
                .build();
    }
}
