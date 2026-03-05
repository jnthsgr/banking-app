package com.banking.dto;

import com.banking.entity.AccountStatus;
import com.banking.entity.AccountType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponseDTO {

    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private Double balance;
    private AccountStatus status;
    private String ownerName;
    private String ownerEmail;
    private LocalDateTime createdAt;
}