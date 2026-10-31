package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.CensusMemberDto;
import com.insureease.insureease_backend.dto.PolicyCreateRequestDto;
import com.insureease.insureease_backend.model.CensusMember;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.model.Organization;
import com.insureease.insureease_backend.repository.CensusMemberRepository;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import com.insureease.insureease_backend.repository.InsuranceClaimRepository;
import com.insureease.insureease_backend.repository.OrganizationRepository;
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
public class PolicyService {

    private final GroupPolicyRepository policyRepository;
    private final OrganizationRepository organizationRepository;
    private final CensusMemberRepository censusMemberRepository;
    private final InsuranceClaimRepository claimRepository;

    public List<GroupPolicy> getAllPolicies(GroupPolicy.PolicyStatus status, GroupPolicy.ProductType productType) {
        if (status != null) {
            return policyRepository.findByStatus(status);
        }
        return policyRepository.findAll();
    }

    public Optional<GroupPolicy> getPolicyById(Long id) {
        return policyRepository.findById(id);
    }

    @Transactional
    public GroupPolicy createPolicy(PolicyCreateRequestDto dto) {
        Organization org = organizationRepository.findById(dto.getOrganizationId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found with ID: " + dto.getOrganizationId()));

        String policyNum = dto.getPolicyNumber();
        if (policyNum == null || policyNum.trim().isEmpty()) {
            policyNum = generatePolicyNumber(dto.getProductType());
        }

        GroupPolicy policy = GroupPolicy.builder()
                .policyNumber(policyNum)
                .organization(org)
                .productType(dto.getProductType())
                .planTier(dto.getPlanTier() != null ? dto.getPlanTier() : GroupPolicy.PlanTier.SILVER)
                .status(GroupPolicy.PolicyStatus.UNDERWRITING)
                .underwritingStatus(GroupPolicy.UnderwritingStatus.PENDING)
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .endDate(dto.getEndDate() != null ? dto.getEndDate() : LocalDate.now().plusYears(1))
                .coveragePerMember(dto.getCoveragePerMember() != null ? dto.getCoveragePerMember() : new BigDecimal("250000.00"))
                .deductibleAmount(dto.getDeductibleAmount() != null ? dto.getDeductibleAmount() : new BigDecimal("500.00"))
                .copayPercentage(dto.getCopayPercentage() != null ? dto.getCopayPercentage() : 10.0)
                .baseAnnualPremium(dto.getBaseAnnualPremium() != null ? dto.getBaseAnnualPremium() : new BigDecimal("75000.00"))
                .billingFrequency(dto.getBillingFrequency() != null ? dto.getBillingFrequency() : GroupPolicy.BillingFrequency.ANNUAL)
                .enrolledMembersCount(0)
                .lossRatio(0.0)
                .underwritingNotes(dto.getUnderwritingNotes())
                .build();

        return policyRepository.save(policy);
    }

    @Transactional
    public GroupPolicy updatePolicy(Long id, GroupPolicy updated) {
        return policyRepository.findById(id).map(p -> {
            p.setPlanTier(updated.getPlanTier() != null ? updated.getPlanTier() : p.getPlanTier());
            p.setStatus(updated.getStatus() != null ? updated.getStatus() : p.getStatus());
            p.setCoveragePerMember(updated.getCoveragePerMember() != null ? updated.getCoveragePerMember() : p.getCoveragePerMember());
            p.setDeductibleAmount(updated.getDeductibleAmount() != null ? updated.getDeductibleAmount() : p.getDeductibleAmount());
            p.setCopayPercentage(updated.getCopayPercentage() != null ? updated.getCopayPercentage() : p.getCopayPercentage());
            p.setBaseAnnualPremium(updated.getBaseAnnualPremium() != null ? updated.getBaseAnnualPremium() : p.getBaseAnnualPremium());
            p.setBillingFrequency(updated.getBillingFrequency() != null ? updated.getBillingFrequency() : p.getBillingFrequency());
            p.setUnderwritingNotes(updated.getUnderwritingNotes() != null ? updated.getUnderwritingNotes() : p.getUnderwritingNotes());
            return policyRepository.save(p);
        }).orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + id));
    }

    public List<CensusMember> getCensusMembers(Long policyId) {
        return censusMemberRepository.findByPolicyId(policyId);
    }

    @Transactional
    public CensusMember addCensusMember(Long policyId, CensusMemberDto dto) {
        GroupPolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + policyId));

        String memberCode = dto.getMemberCode();
        if (memberCode == null || memberCode.trim().isEmpty()) {
            memberCode = "MEM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        CensusMember member = CensusMember.builder()
                .policy(policy)
                .memberCode(memberCode)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(dto.getGender() != null ? dto.getGender() : "M")
                .relationship(dto.getRelationship() != null ? dto.getRelationship() : CensusMember.Relationship.EMPLOYEE)
                .coverageTier(dto.getCoverageTier() != null ? dto.getCoverageTier() : CensusMember.CoverageTier.INDIVIDUAL)
                .effectiveDate(dto.getEffectiveDate() != null ? dto.getEffectiveDate() : policy.getStartDate())
                .status(dto.getStatus() != null ? dto.getStatus() : CensusMember.MemberStatus.ACTIVE)
                .salary(dto.getSalary())
                .preExistingCondition(dto.getPreExistingCondition() != null ? dto.getPreExistingCondition() : false)
                .build();

        CensusMember saved = censusMemberRepository.save(member);
        recalculatePolicyMetrics(policyId);
        return saved;
    }

    @Transactional
    public void recalculatePolicyMetrics(Long policyId) {
        GroupPolicy policy = policyRepository.findById(policyId).orElse(null);
        if (policy == null) return;

        long memberCount = censusMemberRepository.countByPolicyIdAndStatus(policyId, CensusMember.MemberStatus.ACTIVE);
        policy.setEnrolledMembersCount((int) memberCount);

        BigDecimal settledClaims = claimRepository.sumApprovedClaimsByPolicyId(policyId);
        if (policy.getBaseAnnualPremium() != null && policy.getBaseAnnualPremium().compareTo(BigDecimal.ZERO) > 0) {
            double ratio = settledClaims.divide(policy.getBaseAnnualPremium(), 4, RoundingMode.HALF_UP).doubleValue() * 100.0;
            policy.setLossRatio(Math.round(ratio * 100.0) / 100.0);
        }

        policyRepository.save(policy);
    }

    private String generatePolicyNumber(GroupPolicy.ProductType type) {
        String prefix = switch (type) {
            case GROUP_HEALTH -> "GHL";
            case GROUP_LIFE -> "GLF";
            case GROUP_ACCIDENT -> "GAC";
            case GROUP_DENTAL -> "GDN";
            case GROUP_DISABILITY -> "GDS";
        };
        int randomVal = (int) (1000 + Math.random() * 9000);
        return prefix + "-2025-" + randomVal;
    }
}
