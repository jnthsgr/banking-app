package com.banking.dto;

import com.banking.entity.CardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CardRequestDTO {

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotNull(message = "Card type is required")
    private CardType cardType;
}
