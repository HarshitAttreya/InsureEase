package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.UnderwritingAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UnderwritingAssessmentRepository extends JpaRepository<UnderwritingAssessment, Long> {
    Optional<UnderwritingAssessment> findTopByPolicyIdOrderByAssessedAtDesc(Long policyId);
    List<UnderwritingAssessment> findByDecision(UnderwritingAssessment.Decision decision);
}
