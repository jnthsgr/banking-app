package com.banking.dto;

import com.banking.entity.LoanType;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanApplicationRequestDTO {

    @NotNull(message = "Loan type is required")
    private LoanType loanType;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    @NotNull(message = "Tenure is required")
    @Positive(message = "Tenure must be greater than zero")
    private Integer tenureMonths;

    @NotBlank(message = "Disbursement account number is required")
    private String accountNumber;
}
