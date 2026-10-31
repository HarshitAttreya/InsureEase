package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.dto.RenewalQuoteRequestDto;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.RenewalQuote;
import com.insureease.insureease_backend.service.RenewalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/renewals")
@RequiredArgsConstructor
public class RenewalController {

    private final RenewalService renewalService;

    @GetMapping
    public ResponseEntity<List<RenewalQuote>> getAllRenewals() {
        return ResponseEntity.ok(renewalService.getAllRenewals());
    }

    @GetMapping("/eligible-policies")
    public ResponseEntity<List<GroupPolicy>> getEligiblePolicies() {
        return ResponseEntity.ok(renewalService.getPoliciesEligibleForRenewal());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<RenewalQuote> getRenewalByPolicy(@PathVariable Long policyId) {
        return renewalService.getRenewalByPolicyId(policyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/policy/{policyId}/generate")
    public ResponseEntity<RenewalQuote> generateQuote(
            @PathVariable Long policyId,
            @RequestBody(required = false) RenewalQuoteRequestDto dto) {
        return ResponseEntity.ok(renewalService.generateRenewalQuote(policyId, dto));
    }

    @PutMapping("/{quoteId}")
    public ResponseEntity<RenewalQuote> updateQuote(
            @PathVariable Long quoteId,
            @RequestBody RenewalQuoteRequestDto dto) {
        return ResponseEntity.ok(renewalService.updateRenewalQuote(quoteId, dto));
    }

    @PostMapping("/{quoteId}/bind")
    public ResponseEntity<GroupPolicy> bindRenewal(@PathVariable Long quoteId) {
        return ResponseEntity.ok(renewalService.bindRenewal(quoteId));
    }
}
