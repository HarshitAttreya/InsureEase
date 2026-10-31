package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.dto.ClaimAdjudicationDto;
import com.insureease.insureease_backend.dto.ClaimIntakeRequestDto;
import com.insureease.insureease_backend.model.InsuranceClaim;
import com.insureease.insureease_backend.service.ClaimService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping
    public ResponseEntity<List<InsuranceClaim>> getAllClaims(@RequestParam(required = false) InsuranceClaim.ClaimStatus status) {
        return ResponseEntity.ok(claimService.getAllClaims(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceClaim> getClaimById(@PathVariable Long id) {
        return claimService.getClaimById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(claimService.getClaimsByPolicy(policyId));
    }

    @PostMapping("/intake")
    public ResponseEntity<InsuranceClaim> intakeClaim(@Valid @RequestBody ClaimIntakeRequestDto dto) {
        return ResponseEntity.ok(claimService.intakeClaim(dto));
    }

    @PostMapping("/{id}/adjudicate")
    public ResponseEntity<InsuranceClaim> adjudicateClaim(
            @PathVariable Long id,
            @Valid @RequestBody ClaimAdjudicationDto dto) {
        return ResponseEntity.ok(claimService.adjudicateClaim(id, dto));
    }
}
