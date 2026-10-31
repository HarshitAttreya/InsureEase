package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.InsuranceClaim;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClaimAdjudicationDto {
    @NotNull
    private InsuranceClaim.ClaimStatus status;
    
    private BigDecimal approvedAmount;
    private BigDecimal deductibleApplied;
    private BigDecimal copayApplied;
    private String adjudicationNotes;
    private String rejectionReason;
    private String paymentReference;
}
