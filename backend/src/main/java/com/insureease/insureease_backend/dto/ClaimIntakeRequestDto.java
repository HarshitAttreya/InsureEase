package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.InsuranceClaim;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ClaimIntakeRequestDto {
    @NotNull
    private Long policyId;
    
    @NotNull
    private Long memberId;
    
    @NotNull
    private InsuranceClaim.ClaimType claimType;
    
    @NotNull
    private LocalDate incidentDate;
    
    @NotNull
    private BigDecimal claimedAmount;
    
    private String healthcareProvider;
    private String diagnosis;
}
