package com.banking.dto;

import com.banking.entity.CardStatus;
import com.banking.entity.CardType;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardResponseDTO {

    private Long id;
    private String maskedCardNumber;
    private String cardholderName;
    private CardType cardType;
    private CardStatus status;
    private LocalDate expiryDate;
    private Double creditLimit;
    private String accountNumber;
}
