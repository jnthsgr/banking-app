package com.banking.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequestDTO {

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    @Digits(integer = 17, fraction = 2, message = "Amount may have at most 2 decimal places")
    private BigDecimal amount;

    private String targetAccountNumber;

    @Size(max = 255, message = "Description must be at most 255 characters")
    private String description;
}