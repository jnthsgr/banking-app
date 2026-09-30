package com.banking.dto;

import com.banking.entity.TransactionType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponseDTO {

    private Long id;
    private BigDecimal amount;
    private TransactionType transactionType;
    private BigDecimal balanceAfter;
    private String description;
    private String referenceNumber;
    private String accountNumber;
    private LocalDateTime createdAt;
}