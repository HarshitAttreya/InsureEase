package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.DashboardMetricsDto;
import com.insureease.insureease_backend.model.CensusMember;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.InsuranceClaim;
import com.insureease.insureease_backend.repository.BillingInvoiceRepository;
import com.insureease.insureease_backend.repository.CensusMemberRepository;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import com.insureease.insureease_backend.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final GroupPolicyRepository policyRepository;
    private final CensusMemberRepository memberRepository;
    private final InsuranceClaimRepository claimRepository;
    private final BillingInvoiceRepository invoiceRepository;

    public DashboardMetricsDto getDashboardMetrics() {
        List<GroupPolicy> allPolicies = policyRepository.findAll();
        List<GroupPolicy> activePolicies = allPolicies.stream()
                .filter(p -> p.getStatus() == GroupPolicy.PolicyStatus.ACTIVE || p.getStatus() == GroupPolicy.PolicyStatus.RENEWAL_DUE)
                .toList();

        long activeCount = activePolicies.size();

        long coveredLives = activePolicies.stream()
                .mapToLong(p -> p.getEnrolledMembersCount() != null ? p.getEnrolledMembersCount() : 0)
                .sum();

        BigDecimal totalGwp = activePolicies.stream()
                .map(p -> p.getBaseAnnualPremium() != null ? p.getBaseAnnualPremium() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalClaimsSettled = claimRepository.sumAllSettledClaims();

        Double portfolioLossRatio = 0.0;
        if (totalGwp.compareTo(BigDecimal.ZERO) > 0) {
            portfolioLossRatio = totalClaimsSettled.divide(totalGwp, 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            portfolioLossRatio = Math.round(portfolioLossRatio * 100.0) / 100.0;
        }

        long pendingUnderwriting = allPolicies.stream()
                .filter(p -> p.getUnderwritingStatus() == GroupPolicy.UnderwritingStatus.PENDING)
                .count();

        List<InsuranceClaim> allClaims = claimRepository.findAll();
        long openClaims = allClaims.stream()
                .filter(c -> c.getStatus() == InsuranceClaim.ClaimStatus.SUBMITTED
                        || c.getStatus() == InsuranceClaim.ClaimStatus.UNDER_REVIEW
                        || c.getStatus() == InsuranceClaim.ClaimStatus.DOCUMENTS_REQUIRED)
                .count();

        BigDecimal outstandingReceivables = invoiceRepository.sumTotalOutstanding();

        LocalDate now = LocalDate.now();
        long expiringSoon = allPolicies.stream()
                .filter(p -> p.getEndDate() != null && !p.getEndDate().isBefore(now) && p.getEndDate().isBefore(now.plusDays(90)))
                .count();

        Map<String, Long> policiesByProduct = new HashMap<>();
        for (GroupPolicy p : allPolicies) {
            String product = p.getProductType().name();
            policiesByProduct.put(product, policiesByProduct.getOrDefault(product, 0L) + 1);
        }

        Map<String, Long> claimsByStatus = new HashMap<>();
        for (InsuranceClaim c : allClaims) {
            String status = c.getStatus().name();
            claimsByStatus.put(status, claimsByStatus.getOrDefault(status, 0L) + 1);
        }

        return DashboardMetricsDto.builder()
                .totalActivePolicies(activeCount)
                .totalCoveredLives(coveredLives)
                .totalGrossWrittenPremium(totalGwp)
                .totalClaimsSettled(totalClaimsSettled)
                .portfolioLossRatio(portfolioLossRatio)
                .pendingUnderwritingCases(pendingUnderwriting)
                .openClaimsCount(openClaims)
                .totalOutstandingReceivables(outstandingReceivables)
                .policiesExpiringSoon(expiringSoon)
                .policiesByProduct(policiesByProduct)
                .claimsByStatus(claimsByStatus)
                .build();
    }
}
