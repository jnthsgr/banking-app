package com.banking.controller;

import com.banking.dto.CardRequestDTO;
import com.banking.dto.CardResponseDTO;
import com.banking.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public ResponseEntity<CardResponseDTO> issueCard(@Valid @RequestBody CardRequestDTO request) {
        return ResponseEntity.ok(cardService.issueCard(request));
    }

    @GetMapping
    public ResponseEntity<List<CardResponseDTO>> getMyCards() {
        return ResponseEntity.ok(cardService.getMyCards());
    }

    @PatchMapping("/{cardId}/lock")
    public ResponseEntity<CardResponseDTO> lockCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(cardService.setLocked(cardId, true));
    }

    @PatchMapping("/{cardId}/unlock")
    public ResponseEntity<CardResponseDTO> unlockCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(cardService.setLocked(cardId, false));
    }
}
