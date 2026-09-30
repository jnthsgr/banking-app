package com.banking.dto;

import com.banking.entity.LoanStatus;
import com.banking.entity.LoanType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponseDTO {

    private Long id;
    private LoanType loanType;
    private BigDecimal principalAmount;
    private Double interestRateApr;
    private Integer tenureMonths;
    private BigDecimal monthlyInstallment;
    private LoanStatus status;
    private String disbursementAccountNumber;
    private LocalDateTime createdAt;
}
