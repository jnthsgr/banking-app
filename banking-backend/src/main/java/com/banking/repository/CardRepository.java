package com.banking.repository;

import com.banking.entity.Card;
import com.banking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByAccount_User(User user);

    Optional<Card> findByCardNumber(String cardNumber);

    boolean existsByCardNumber(String cardNumber);
}
