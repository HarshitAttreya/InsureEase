package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.CensusMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CensusMemberRepository extends JpaRepository<CensusMember, Long> {
    List<CensusMember> findByPolicyId(Long policyId);
    List<CensusMember> findByPolicyIdAndStatus(Long policyId, CensusMember.MemberStatus status);
    long countByPolicyIdAndStatus(Long policyId, CensusMember.MemberStatus status);
    long countByPolicyId(Long policyId);
}
