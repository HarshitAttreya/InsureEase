package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.UnderwritingAssessment;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UnderwritingDecisionDto {
    @NotNull
    private Long policyId;
    
    private String underwriterName;
    
    @NotNull
    private UnderwritingAssessment.Decision decision;
    
    private Double recommendedLoadingPct;
    private String decisionNotes;
    private String specialConditions;
}
