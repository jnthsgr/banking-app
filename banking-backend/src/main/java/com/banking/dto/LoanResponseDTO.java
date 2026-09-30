package com.banking.dto;

import com.banking.entity.LoanStatus;
import com.banking.entity.LoanType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponseDTO {

    private Long id;
    private LoanType loanType;
    private Double principalAmount;
    private Double interestRateApr;
    private Integer tenureMonths;
    private Double monthlyInstallment;
    private LoanStatus status;
    private String disbursementAccountNumber;
    private LocalDateTime createdAt;
}
