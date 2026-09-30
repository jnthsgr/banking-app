package com.banking.dto;

import com.banking.entity.LoanType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanProductDTO {

    private LoanType loanType;
    private String displayName;
    private String description;
    private double interestRateApr;
    private double maxAmount;
    private int maxTenureMonths;
}
