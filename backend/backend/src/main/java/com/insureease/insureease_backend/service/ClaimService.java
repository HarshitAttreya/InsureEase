package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.ClaimAdjudicationDto;
import com.insureease.insureease_backend.dto.ClaimIntakeRequestDto;
import com.insureease.insureease_backend.model.CensusMember;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.InsuranceClaim;
import com.insureease.insureease_backend.repository.CensusMemberRepository;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import com.insureease.insureease_backend.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final InsuranceClaimRepository claimRepository;
    private final GroupPolicyRepository policyRepository;
    private final CensusMemberRepository censusMemberRepository;
    private final PolicyService policyService;

    public List<InsuranceClaim> getAllClaims(InsuranceClaim.ClaimStatus status) {
        if (status != null) {
            return claimRepository.findByStatus(status);
        }
        return claimRepository.findAll();
    }

    public List<InsuranceClaim> getClaimsByPolicy(Long policyId) {
        return claimRepository.findByPolicyId(policyId);
    }

    public Optional<InsuranceClaim> getClaimById(Long id) {
        return claimRepository.findById(id);
    }

    @Transactional
    public InsuranceClaim intakeClaim(ClaimIntakeRequestDto dto) {
        GroupPolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + dto.getPolicyId()));

        CensusMember member = censusMemberRepository.findById(dto.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("Census member not found with ID: " + dto.getMemberId()));

        String claimNumber = "CLM-2025-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Calculate expected deductible and copay preview
        BigDecimal claimed = dto.getClaimedAmount();
        BigDecimal deductible = policy.getDeductibleAmount() != null ? policy.getDeductibleAmount() : BigDecimal.ZERO;
        deductible = claimed.min(deductible);

        BigDecimal remainder = claimed.subtract(deductible);
        double copayPct = policy.getCopayPercentage() != null ? policy.getCopayPercentage() : 0.0;
        BigDecimal copay = remainder.multiply(BigDecimal.valueOf(copayPct / 100.0)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedApproval = remainder.subtract(copay).max(BigDecimal.ZERO);

        // Cap at policy coverage limit
        if (policy.getCoveragePerMember() != null && estimatedApproval.compareTo(policy.getCoveragePerMember()) > 0) {
            estimatedApproval = policy.getCoveragePerMember();
        }

        InsuranceClaim claim = InsuranceClaim.builder()
                .claimNumber(claimNumber)
                .policy(policy)
                .member(member)
                .claimType(dto.getClaimType())
                .incidentDate(dto.getIncidentDate())
                .submissionDate(LocalDate.now())
                .claimedAmount(claimed)
                .approvedAmount(estimatedApproval)
                .deductibleApplied(deductible)
                .copayApplied(copay)
                .healthcareProvider(dto.getHealthcareProvider())
                .diagnosis(dto.getDiagnosis())
                .status(InsuranceClaim.ClaimStatus.SUBMITTED)
                .adjudicationNotes("Claim registered via intake workflow. Initial benefit calculation performed.")
                .build();

        return claimRepository.save(claim);
    }

    @Transactional
    public InsuranceClaim adjudicateClaim(Long claimId, ClaimAdjudicationDto dto) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

        claim.setStatus(dto.getStatus());
        if (dto.getApprovedAmount() != null) {
            claim.setApprovedAmount(dto.getApprovedAmount());
        }
        if (dto.getDeductibleApplied() != null) {
            claim.setDeductibleApplied(dto.getDeductibleApplied());
        }
        if (dto.getCopayApplied() != null) {
            claim.setCopayApplied(dto.getCopayApplied());
        }
        if (dto.getAdjudicationNotes() != null) {
            claim.setAdjudicationNotes(dto.getAdjudicationNotes());
        }
        if (dto.getRejectionReason() != null) {
            claim.setRejectionReason(dto.getRejectionReason());
        }

        if (dto.getStatus() == InsuranceClaim.ClaimStatus.APPROVED || dto.getStatus() == InsuranceClaim.ClaimStatus.SETTLED) {
            if (claim.getSettlementDate() == null) {
                claim.setSettlementDate(LocalDate.now());
            }
            if (claim.getPaymentReference() == null) {
                claim.setPaymentReference(dto.getPaymentReference() != null ? dto.getPaymentReference() : "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }
        }

        InsuranceClaim saved = claimRepository.save(claim);
        // Refresh policy loss ratio
        policyService.recalculatePolicyMetrics(claim.getPolicy().getId());
        return saved;
    }
}
