package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "underwriting_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnderwritingAssessment {

    public enum Decision {
        PENDING,
        APPROVED,
        CONDITIONALLY_APPROVED,
        DECLINED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private GroupPolicy policy;

    @Column(name = "assessed_at")
    private LocalDateTime assessedAt;

    @Column(name = "underwriter_name")
    private String underwriterName;

    @Column(name = "overall_risk_score")
    private Double overallRiskScore; // 0 - 100

    @Column(name = "industry_hazard_score")
    private Double industryHazardScore;

    @Column(name = "demographic_risk_score")
    private Double demographicRiskScore; // Age & group size distribution

    @Column(name = "claims_history_factor")
    private Double claimsHistoryFactor;

    @Column(name = "recommended_loading_pct")
    private Double recommendedLoadingPct; // e.g. +5.0% or -2.5%

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Decision decision;

    @Column(name = "decision_notes", length = 2000)
    private String decisionNotes;

    @Column(name = "special_conditions", length = 1000)
    private String specialConditions;

    @PrePersist
    protected void onCreate() {
        if (this.assessedAt == null) {
            this.assessedAt = LocalDateTime.now();
        }
        if (this.decision == null) {
            this.decision = Decision.PENDING;
        }
    }
}
