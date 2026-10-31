package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.GroupPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupPolicyRepository extends JpaRepository<GroupPolicy, Long> {
    Optional<GroupPolicy> findByPolicyNumber(String policyNumber);
    List<GroupPolicy> findByOrganizationId(Long organizationId);
    List<GroupPolicy> findByStatus(GroupPolicy.PolicyStatus status);
    List<GroupPolicy> findByUnderwritingStatus(GroupPolicy.UnderwritingStatus underwritingStatus);
    
    @Query("SELECT p FROM GroupPolicy p WHERE p.endDate BETWEEN :startDate AND :endDate")
    List<GroupPolicy> findPoliciesExpiringBetween(LocalDate startDate, LocalDate endDate);
}
