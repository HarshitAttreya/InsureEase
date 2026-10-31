package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.RenewalQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RenewalQuoteRepository extends JpaRepository<RenewalQuote, Long> {
    List<RenewalQuote> findByPolicyId(Long policyId);
    Optional<RenewalQuote> findTopByPolicyIdOrderByCreatedAtDesc(Long policyId);
    List<RenewalQuote> findByStatus(RenewalQuote.RenewalStatus status);
}
