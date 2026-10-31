package com.insureease.insureease_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDto {
    private long totalActivePolicies;
    private long totalCoveredLives;
    private BigDecimal totalGrossWrittenPremium;
    private BigDecimal totalClaimsSettled;
    private Double portfolioLossRatio;
    private long pendingUnderwritingCases;
    private long openClaimsCount;
    private BigDecimal totalOutstandingReceivables;
    private long policiesExpiringSoon;
    private Map<String, Long> policiesByProduct;
    private Map<String, Long> claimsByStatus;
}
