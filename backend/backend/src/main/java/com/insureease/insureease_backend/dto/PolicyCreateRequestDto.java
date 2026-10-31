package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.GroupPolicy;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PolicyCreateRequestDto {
    private String policyNumber;
    
    @NotNull
    private Long organizationId;
    
    @NotNull
    private GroupPolicy.ProductType productType;
    
    @NotNull
    private GroupPolicy.PlanTier planTier;
    
    @NotNull
    private LocalDate startDate;
    
    @NotNull
    private LocalDate endDate;
    
    private BigDecimal coveragePerMember;
    private BigDecimal deductibleAmount;
    private Double copayPercentage;
    private BigDecimal baseAnnualPremium;
    private GroupPolicy.BillingFrequency billingFrequency;
    private String underwritingNotes;
}
