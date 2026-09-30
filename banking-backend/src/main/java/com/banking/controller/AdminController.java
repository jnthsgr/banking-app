package com.banking.controller;

import com.banking.dto.AccountResponseDTO;
import com.banking.dto.AdminUserResponseDTO;
import com.banking.entity.AccountStatus;
import com.banking.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDTO>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountResponseDTO>> listAccounts() {
        return ResponseEntity.ok(adminService.listAccounts());
    }

    @PatchMapping("/accounts/{accountNumber}/freeze")
    public ResponseEntity<AccountResponseDTO> freezeAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(adminService.setAccountStatus(accountNumber, AccountStatus.FROZEN));
    }

    @PatchMapping("/accounts/{accountNumber}/unfreeze")
    public ResponseEntity<AccountResponseDTO> unfreezeAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(adminService.setAccountStatus(accountNumber, AccountStatus.ACTIVE));
    }
}
