package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.dto.InvoiceCreateRequestDto;
import com.insureease.insureease_backend.dto.PaymentRecordDto;
import com.insureease.insureease_backend.model.BillingInvoice;
import com.insureease.insureease_backend.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/invoices")
    public ResponseEntity<List<BillingInvoice>> getAllInvoices(
            @RequestParam(required = false) BillingInvoice.InvoiceStatus status) {
        return ResponseEntity.ok(billingService.getAllInvoices(status));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<BillingInvoice> getInvoiceById(@PathVariable Long id) {
        return billingService.getInvoiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<BillingInvoice>> getInvoicesByPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(billingService.getInvoicesByPolicy(policyId));
    }

    @PostMapping("/invoices")
    public ResponseEntity<BillingInvoice> generateInvoice(@Valid @RequestBody InvoiceCreateRequestDto dto) {
        return ResponseEntity.ok(billingService.generateInvoice(dto));
    }

    @PostMapping("/invoices/{id}/payment")
    public ResponseEntity<BillingInvoice> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody PaymentRecordDto dto) {
        return ResponseEntity.ok(billingService.recordPayment(id, dto));
    }
}
