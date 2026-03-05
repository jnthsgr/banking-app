package com.banking.dto;

import com.banking.entity.TransactionType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponseDTO {

    private Long id;
    private Double amount;
    private TransactionType transactionType;
    private Double balanceAfter;
    private String description;
    private String referenceNumber;
    private String accountNumber;
    private LocalDateTime createdAt;
}