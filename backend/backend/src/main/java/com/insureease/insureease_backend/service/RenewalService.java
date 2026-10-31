package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.RenewalQuoteRequestDto;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.RenewalQuote;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import com.insureease.insureease_backend.repository.RenewalQuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RenewalService {

    private final RenewalQuoteRepository renewalQuoteRepository;
    private final GroupPolicyRepository policyRepository;

    public List<RenewalQuote> getAllRenewals() {
        return renewalQuoteRepository.findAll();
    }

    public List<GroupPolicy> getPoliciesEligibleForRenewal() {
        LocalDate now = LocalDate.now();
        LocalDate windowEnd = now.plusDays(90);
        return policyRepository.findPoliciesExpiringBetween(now.minusDays(30), windowEnd);
    }

    public Optional<RenewalQuote> getRenewalByPolicyId(Long policyId) {
        return renewalQuoteRepository.findTopByPolicyIdOrderByCreatedAtDesc(policyId);
    }

    @Transactional
    public RenewalQuote generateRenewalQuote(Long policyId, RenewalQuoteRequestDto dto) {
        GroupPolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + policyId));

        BigDecimal prevPremium = policy.getBaseAnnualPremium() != null ? policy.getBaseAnnualPremium() : BigDecimal.ZERO;
        double currentLossRatio = policy.getLossRatio() != null ? policy.getLossRatio() : 0.0;

        // Auto-calculate rate adjustment based on claims experience if not explicitly provided
        double rateAdjustment = dto != null && dto.getRateAdjustmentPct() != null
                ? dto.getRateAdjustmentPct()
                : calculateRecommendedRateChange(currentLossRatio);

        BigDecimal proposedPremium;
        if (dto != null && dto.getProposedAnnualPremium() != null) {
            proposedPremium = dto.getProposedAnnualPremium();
        } else {
            proposedPremium = prevPremium.multiply(BigDecimal.valueOf(1.0 + (rateAdjustment / 100.0)))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        RenewalQuote quote = RenewalQuote.builder()
                .policy(policy)
                .renewalYear(policy.getEndDate().getYear())
                .previousAnnualPremium(prevPremium)
                .proposedAnnualPremium(proposedPremium)
                .rateAdjustmentPct(rateAdjustment)
                .lossRatioExperience(currentLossRatio)
                .status(dto != null && dto.getStatus() != null ? dto.getStatus() : RenewalQuote.RenewalStatus.QUOTED)
                .expiryDate(policy.getEndDate())
                .quoteValidUntil(dto != null && dto.getQuoteValidUntil() != null ? dto.getQuoteValidUntil() : policy.getEndDate().minusDays(15))
                .notes(dto != null && dto.getNotes() != null
                        ? dto.getNotes()
                        : "Renewal quote calculated based on loss ratio experience of " + String.format("%.1f%%", currentLossRatio) + " with rate adjustment of " + String.format("%+.1f%%", rateAdjustment))
                .build();

        // Mark policy status as RENEWAL_DUE
        if (policy.getStatus() == GroupPolicy.PolicyStatus.ACTIVE) {
            policy.setStatus(GroupPolicy.PolicyStatus.RENEWAL_DUE);
            policyRepository.save(policy);
        }

        return renewalQuoteRepository.save(quote);
    }

    @Transactional
    public RenewalQuote updateRenewalQuote(Long quoteId, RenewalQuoteRequestDto dto) {
        RenewalQuote quote = renewalQuoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Renewal quote not found with ID: " + quoteId));

        if (dto.getRateAdjustmentPct() != null) {
            quote.setRateAdjustmentPct(dto.getRateAdjustmentPct());
            BigDecimal prev = quote.getPreviousAnnualPremium();
            quote.setProposedAnnualPremium(prev.multiply(BigDecimal.valueOf(1.0 + (dto.getRateAdjustmentPct() / 100.0))).setScale(2, RoundingMode.HALF_UP));
        }
        if (dto.getProposedAnnualPremium() != null) {
            quote.setProposedAnnualPremium(dto.getProposedAnnualPremium());
        }
        if (dto.getStatus() != null) {
            quote.setStatus(dto.getStatus());
        }
        if (dto.getNotes() != null) {
            quote.setNotes(dto.getNotes());
        }

        return renewalQuoteRepository.save(quote);
    }

    @Transactional
    public GroupPolicy bindRenewal(Long quoteId) {
        RenewalQuote quote = renewalQuoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("Renewal quote not found with ID: " + quoteId));

        GroupPolicy policy = quote.getPolicy();
        policy.setStartDate(policy.getEndDate());
        policy.setEndDate(policy.getEndDate().plusYears(1));
        policy.setBaseAnnualPremium(quote.getProposedAnnualPremium());
        policy.setStatus(GroupPolicy.PolicyStatus.ACTIVE);
        policy.setLossRatio(0.0); // Reset for new term

        quote.setStatus(RenewalQuote.RenewalStatus.BOUND);
        renewalQuoteRepository.save(quote);

        return policyRepository.save(policy);
    }

    private double calculateRecommendedRateChange(double lossRatio) {
        if (lossRatio > 85.0) return 15.0;
        if (lossRatio > 70.0) return 8.5;
        if (lossRatio > 55.0) return 4.0;
        if (lossRatio < 35.0) return -3.5;
        return 2.5; // Baseline medical/general inflation
    }
}
