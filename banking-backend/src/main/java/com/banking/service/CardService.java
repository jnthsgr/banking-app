package com.banking.service;

import com.banking.dto.CardRequestDTO;
import com.banking.dto.CardResponseDTO;
import com.banking.entity.*;
import com.banking.exception.AccountFrozenException;
import com.banking.exception.ForbiddenOperationException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.repository.AccountRepository;
import com.banking.repository.CardRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private static final BigDecimal DEFAULT_CREDIT_LIMIT = new BigDecimal("150000.00");

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateCardNumber() {
        String number;
        do {
            StringBuilder sb = new StringBuilder("4"); // Visa-style prefix
            Random random = new Random();
            for (int i = 0; i < 15; i++) {
                sb.append(random.nextInt(10));
            }
            number = sb.toString();
        } while (cardRepository.existsByCardNumber(number));
        return number;
    }

    private String mask(String cardNumber) {
        return "•••• •••• •••• " + cardNumber.substring(cardNumber.length() - 4);
    }

    private CardResponseDTO mapToDTO(Card card) {
        return CardResponseDTO.builder()
                .id(card.getId())
                .maskedCardNumber(mask(card.getCardNumber()))
                .cardholderName(card.getCardholderName())
                .cardType(card.getCardType())
                .status(card.getStatus())
                .expiryDate(card.getExpiryDate())
                .creditLimit(card.getCreditLimit())
                .accountNumber(card.getAccount().getAccountNumber())
                .build();
    }

    @Transactional
    public CardResponseDTO issueCard(CardRequestDTO request) {
        User user = getCurrentUser();

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + request.getAccountNumber()));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You do not have access to this account");
        }
        if (account.getStatus() == AccountStatus.FROZEN) {
            throw new AccountFrozenException("Cannot issue a card on a frozen account");
        }

        Card card = Card.builder()
                .cardNumber(generateCardNumber())
                .cardholderName(user.getFullName())
                .cardType(request.getCardType())
                .status(CardStatus.ACTIVE)
                .expiryDate(LocalDate.now().plusYears(4))
                .creditLimit(request.getCardType() == CardType.CREDIT ? DEFAULT_CREDIT_LIMIT : null)
                .account(account)
                .build();

        cardRepository.save(card);
        return mapToDTO(card);
    }

    public List<CardResponseDTO> getMyCards() {
        User user = getCurrentUser();
        return cardRepository.findByAccount_User(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Card getVerifiedCard(Long cardId) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        User user = getCurrentUser();
        if (!card.getAccount().getUser().getId().equals(user.getId())) {
            throw new ForbiddenOperationException("You do not have access to this card");
        }
        return card;
    }

    @Transactional
    public CardResponseDTO setLocked(Long cardId, boolean locked) {
        Card card = getVerifiedCard(cardId);
        card.setStatus(locked ? CardStatus.LOCKED : CardStatus.ACTIVE);
        cardRepository.save(card);
        return mapToDTO(card);
    }
}
