package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.RenewalQuote;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RenewalQuoteRequestDto {
    @NotNull
    private Long policyId;
    
    private Double rateAdjustmentPct; // e.g. +5% or -3%
    private BigDecimal proposedAnnualPremium;
    private RenewalQuote.RenewalStatus status;
    private LocalDate quoteValidUntil;
    private String notes;
}
