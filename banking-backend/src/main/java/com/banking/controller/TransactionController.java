package com.banking.controller;

import com.banking.dto.TransactionRequestDTO;
import com.banking.dto.TransactionResponseDTO;
import com.banking.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private static final DateTimeFormatter CSV_DATE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponseDTO> deposit(
            @Valid @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.deposit(request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponseDTO> withdraw(
            @Valid @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.withdraw(request));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponseDTO> transfer(
            @Valid @RequestBody TransactionRequestDTO request) {
        return ResponseEntity.ok(transactionService.transfer(request));
    }

    /**
     * Full, unpaginated history — retained for callers that need the complete list.
     */
    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<List<TransactionResponseDTO>> getHistory(
            @PathVariable String accountNumber) {
        return ResponseEntity.ok(transactionService.getHistory(accountNumber));
    }

    /**
     * Paginated history for the dashboard's transaction table.
     */
    @GetMapping("/history/{accountNumber}/page")
    public ResponseEntity<Page<TransactionResponseDTO>> getHistoryPaged(
            @PathVariable String accountNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(transactionService.getHistoryPaged(accountNumber, pageable));
    }

    /**
     * Downloadable CSV account statement.
     */
    @GetMapping("/statement/{accountNumber}")
    public ResponseEntity<String> downloadStatement(@PathVariable String accountNumber) {
        List<TransactionResponseDTO> transactions = transactionService.getHistory(accountNumber);

        StringBuilder csv = new StringBuilder();
        csv.append("Date,Type,Description,Reference,Amount,Balance After\n");
        for (TransactionResponseDTO txn : transactions) {
            csv.append(txn.getCreatedAt().format(CSV_DATE_FORMAT)).append(',')
                    .append(txn.getTransactionType()).append(',')
                    .append('"').append(txn.getDescription() == null ? "" : txn.getDescription().replace("\"", "'")).append('"').append(',')
                    .append(txn.getReferenceNumber()).append(',')
                    .append(txn.getAmount()).append(',')
                    .append(txn.getBalanceAfter()).append('\n');
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"statement-" + accountNumber + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }
}
