package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.UnderwritingDecisionDto;
import com.insureease.insureease_backend.model.CensusMember;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.UnderwritingAssessment;
import com.insureease.insureease_backend.repository.CensusMemberRepository;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import com.insureease.insureease_backend.repository.UnderwritingAssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UnderwritingService {

    private final UnderwritingAssessmentRepository assessmentRepository;
    private final GroupPolicyRepository policyRepository;
    private final CensusMemberRepository censusMemberRepository;

    public List<UnderwritingAssessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    public Optional<UnderwritingAssessment> getAssessmentByPolicyId(Long policyId) {
        return assessmentRepository.findTopByPolicyIdOrderByAssessedAtDesc(policyId);
    }

    @Transactional
    public UnderwritingAssessment evaluatePolicyRisk(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + policyId));

        List<CensusMember> members = censusMemberRepository.findByPolicyId(policyId);

        // Calculate demographic score
        double avgAge = 35.0;
        double preExistingRatio = 0.05;
        if (!members.isEmpty()) {
            double totalAge = 0;
            int preExistingCount = 0;
            LocalDate now = LocalDate.now();
            for (CensusMember m : members) {
                totalAge += Period.between(m.getDateOfBirth(), now).getYears();
                if (Boolean.TRUE.equals(m.getPreExistingCondition())) {
                    preExistingCount++;
                }
            }
            avgAge = totalAge / members.size();
            preExistingRatio = (double) preExistingCount / members.size();
        }

        double demographicScore = Math.min(100.0, (avgAge * 1.2) + (preExistingRatio * 100.0 * 0.5));
        double industryFactor = policy.getOrganization() != null && policy.getOrganization().getIndustryRiskFactor() != null
                ? policy.getOrganization().getIndustryRiskFactor()
                : 1.0;
        double industryHazardScore = Math.min(100.0, industryFactor * 45.0);

        // Overall risk score (scale 0 - 100)
        double overallScore = (demographicScore * 0.45) + (industryHazardScore * 0.55);
        overallScore = Math.round(overallScore * 10.0) / 10.0;

        // Recommended loading percentage
        double recommendedLoading = 0.0;
        if (overallScore > 75.0) {
            recommendedLoading = 15.0; // High hazard: +15%
        } else if (overallScore > 60.0) {
            recommendedLoading = 7.5;  // Moderate: +7.5%
        } else if (overallScore < 40.0) {
            recommendedLoading = -3.0; // Favorable risk: 3% discount
        }

        UnderwritingAssessment assessment = UnderwritingAssessment.builder()
                .policy(policy)
                .underwriterName("Automated Underwriting Engine (Rules v2.4)")
                .overallRiskScore(overallScore)
                .industryHazardScore(Math.round(industryHazardScore * 10.0) / 10.0)
                .demographicRiskScore(Math.round(demographicScore * 10.0) / 10.0)
                .claimsHistoryFactor(policy.getLossRatio() != null ? policy.getLossRatio() : 0.0)
                .recommendedLoadingPct(recommendedLoading)
                .decision(overallScore > 85.0 ? UnderwritingAssessment.Decision.CONDITIONALLY_APPROVED : UnderwritingAssessment.Decision.APPROVED)
                .decisionNotes("Automated group underwriting assessment completed. Average member age: "
                        + String.format("%.1f", avgAge)
                        + " yrs, pre-existing ratio: " + String.format("%.1f%%", preExistingRatio * 100.0)
                        + ", industry hazard index: " + industryFactor)
                .specialConditions(overallScore > 75.0 ? "Requires mandatory wellness check and exclusion of hazardous leisure activities" : "Standard policy terms apply")
                .build();

        return assessmentRepository.save(assessment);
    }

    @Transactional
    public UnderwritingAssessment submitDecision(UnderwritingDecisionDto dto) {
        GroupPolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + dto.getPolicyId()));

        UnderwritingAssessment assessment = assessmentRepository.findTopByPolicyIdOrderByAssessedAtDesc(dto.getPolicyId())
                .orElseGet(() -> evaluatePolicyRisk(dto.getPolicyId()));

        assessment.setDecision(dto.getDecision());
        assessment.setUnderwriterName(dto.getUnderwriterName() != null ? dto.getUnderwriterName() : "Lead Group Underwriter");
        assessment.setDecisionNotes(dto.getDecisionNotes());
        assessment.setSpecialConditions(dto.getSpecialConditions());
        if (dto.getRecommendedLoadingPct() != null) {
            assessment.setRecommendedLoadingPct(dto.getRecommendedLoadingPct());
        }

        // Update policy status
        switch (dto.getDecision()) {
            case APPROVED, CONDITIONALLY_APPROVED -> {
                policy.setUnderwritingStatus(dto.getDecision() == UnderwritingAssessment.Decision.APPROVED
                        ? GroupPolicy.UnderwritingStatus.APPROVED
                        : GroupPolicy.UnderwritingStatus.CONDITIONAL);
                policy.setStatus(GroupPolicy.PolicyStatus.ACTIVE);

                // Apply premium adjustment if loading specified
                if (dto.getRecommendedLoadingPct() != null && dto.getRecommendedLoadingPct() != 0.0) {
                    BigDecimal base = policy.getBaseAnnualPremium();
                    if (base != null) {
                        BigDecimal multiplier = BigDecimal.valueOf(1.0 + (dto.getRecommendedLoadingPct() / 100.0));
                        policy.setBaseAnnualPremium(base.multiply(multiplier).setScale(2, java.math.RoundingMode.HALF_UP));
                    }
                }
            }
            case DECLINED -> {
                policy.setUnderwritingStatus(GroupPolicy.UnderwritingStatus.REJECTED);
                policy.setStatus(GroupPolicy.PolicyStatus.TERMINATED);
            }
            default -> policy.setUnderwritingStatus(GroupPolicy.UnderwritingStatus.PENDING);
        }

        policyRepository.save(policy);
        return assessmentRepository.save(assessment);
    }
}
