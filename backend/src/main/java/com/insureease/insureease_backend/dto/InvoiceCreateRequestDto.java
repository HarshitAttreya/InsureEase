package com.insureease.insureease_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class InvoiceCreateRequestDto {
    @NotNull
    private Long policyId;
    
    private String billingPeriod; // e.g. "Q2 2025" or "May 2025"
    private LocalDate dueDate;
    private BigDecimal baseAmount;
    private BigDecimal taxesAndFees;
}
