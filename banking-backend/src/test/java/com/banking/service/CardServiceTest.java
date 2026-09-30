package com.banking.service;

import com.banking.dto.CardRequestDTO;
import com.banking.dto.CardResponseDTO;
import com.banking.entity.*;
import com.banking.exception.AccountFrozenException;
import com.banking.exception.ForbiddenOperationException;
import com.banking.repository.AccountRepository;
import com.banking.repository.CardRepository;
import com.banking.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private UserRepository userRepository;

    private CardService cardService;
    private User owner;
    private Account account;

    @BeforeEach
    void setUp() {
        cardService = new CardService(cardRepository, accountRepository, userRepository);
        owner = User.builder().id(1L).fullName("Jane Doe").email("jane@example.com").build();
        account = Account.builder()
                .id(10L)
                .accountNumber("1111111111")
                .balance(BigDecimal.ZERO)
                .status(AccountStatus.ACTIVE)
                .user(owner)
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(owner.getEmail(), null));
        lenient().when(userRepository.findByEmail(owner.getEmail())).thenReturn(Optional.of(owner));
        lenient().when(accountRepository.findByAccountNumber(account.getAccountNumber())).thenReturn(Optional.of(account));
        lenient().when(cardRepository.existsByCardNumber(any())).thenReturn(false);
        lenient().when(cardRepository.save(any(Card.class))).thenAnswer(inv -> {
            Card c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
    }

    @Test
    void issueCreditCard_getsADefaultCreditLimit() {
        CardRequestDTO request = new CardRequestDTO(account.getAccountNumber(), CardType.CREDIT);

        CardResponseDTO result = cardService.issueCard(request);

        assertThat(result.getCreditLimit()).isNotNull();
        assertThat(result.getCreditLimit()).isPositive();
        assertThat(result.getCardType()).isEqualTo(CardType.CREDIT);
        assertThat(result.getStatus()).isEqualTo(CardStatus.ACTIVE);
    }

    @Test
    void issueDebitCard_hasNoCreditLimit() {
        CardRequestDTO request = new CardRequestDTO(account.getAccountNumber(), CardType.DEBIT);

        CardResponseDTO result = cardService.issueCard(request);

        assertThat(result.getCreditLimit()).isNull();
    }

    @Test
    void issueCard_onFrozenAccount_throws() {
        account.setStatus(AccountStatus.FROZEN);
        CardRequestDTO request = new CardRequestDTO(account.getAccountNumber(), CardType.DEBIT);

        assertThatThrownBy(() -> cardService.issueCard(request))
                .isInstanceOf(AccountFrozenException.class);
    }

    @Test
    void issueCard_onSomeoneElsesAccount_throwsForbidden() {
        User someoneElse = User.builder().id(2L).email("other@example.com").build();
        account.setUser(someoneElse);
        CardRequestDTO request = new CardRequestDTO(account.getAccountNumber(), CardType.DEBIT);

        assertThatThrownBy(() -> cardService.issueCard(request))
                .isInstanceOf(ForbiddenOperationException.class);
    }

    @Test
    void setLocked_togglesCardStatus() {
        Card card = Card.builder()
                .id(5L)
                .cardNumber("4123456789012345")
                .cardholderName("Jane Doe")
                .cardType(CardType.DEBIT)
                .status(CardStatus.ACTIVE)
                .account(account)
                .build();
        when(cardRepository.findById(5L)).thenReturn(Optional.of(card));
        when(cardRepository.save(any(Card.class))).thenReturn(card);

        CardResponseDTO locked = cardService.setLocked(5L, true);
        assertThat(locked.getStatus()).isEqualTo(CardStatus.LOCKED);

        CardResponseDTO unlocked = cardService.setLocked(5L, false);
        assertThat(unlocked.getStatus()).isEqualTo(CardStatus.ACTIVE);
    }
}
