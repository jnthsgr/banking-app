package com.banking.repository;

import com.banking.entity.Loan;
import com.banking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByUserOrderByCreatedAtDesc(User user);
}
