package com.banking.dto;

import com.banking.entity.LoanType;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanProductDTO {

    private LoanType loanType;
    private String displayName;
    private String description;
    private double interestRateApr;
    private BigDecimal maxAmount;
    private int maxTenureMonths;
}
