package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByPolicyId(Long policyId);
    List<InsuranceClaim> findByMemberId(Long memberId);
    List<InsuranceClaim> findByStatus(InsuranceClaim.ClaimStatus status);
    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    @Query("SELECT COALESCE(SUM(c.approvedAmount), 0) FROM InsuranceClaim c WHERE c.policy.id = :policyId AND c.status IN ('APPROVED', 'SETTLED')")
    BigDecimal sumApprovedClaimsByPolicyId(Long policyId);

    @Query("SELECT COALESCE(SUM(c.approvedAmount), 0) FROM InsuranceClaim c WHERE c.status IN ('APPROVED', 'SETTLED')")
    BigDecimal sumAllSettledClaims();
}
