package com.banking.dto;

import com.banking.entity.AccountType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountRequestDTO {

    @NotNull(message = "Account type is required")
    private AccountType accountType;   // SAVINGS or CURRENT
}