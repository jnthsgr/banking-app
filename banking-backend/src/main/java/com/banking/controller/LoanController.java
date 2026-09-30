package com.banking.controller;

import com.banking.dto.LoanApplicationRequestDTO;
import com.banking.dto.LoanProductDTO;
import com.banking.dto.LoanResponseDTO;
import com.banking.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @GetMapping("/products")
    public ResponseEntity<List<LoanProductDTO>> getProducts() {
        return ResponseEntity.ok(loanService.getProductCatalog());
    }

    @PostMapping("/apply")
    public ResponseEntity<LoanResponseDTO> apply(@Valid @RequestBody LoanApplicationRequestDTO request) {
        return ResponseEntity.ok(loanService.applyForLoan(request));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<LoanResponseDTO>> getMyLoans() {
        return ResponseEntity.ok(loanService.getMyLoans());
    }
}
