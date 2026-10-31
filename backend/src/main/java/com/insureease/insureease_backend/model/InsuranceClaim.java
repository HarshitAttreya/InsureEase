package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InsuranceClaim {

    public enum ClaimType {
        HOSPITALIZATION,
        OUTPATIENT,
        ACCIDENT,
        SURGERY,
        DENTAL,
        OPTICAL,
        DEATH,
        DISABILITY
    }

    public enum ClaimStatus {
        SUBMITTED,
        UNDER_REVIEW,
        DOCUMENTS_REQUIRED,
        APPROVED,
        REJECTED,
        SETTLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "claim_number", nullable = false, unique = true)
    private String claimNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private GroupPolicy policy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "member_id", nullable = false)
    private CensusMember member;

    @Enumerated(EnumType.STRING)
    @Column(name = "claim_type", nullable = false)
    private ClaimType claimType;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "claimed_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal claimedAmount;

    @Column(name = "approved_amount", precision = 12, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "deductible_applied", precision = 10, scale = 2)
    private BigDecimal deductibleApplied;

    @Column(name = "copay_applied", precision = 10, scale = 2)
    private BigDecimal copayApplied;

    @Column(name = "healthcare_provider")
    private String healthcareProvider;

    @Column(length = 1000)
    private String diagnosis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    @Column(name = "adjudication_notes", length = 1500)
    private String adjudicationNotes;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @Column(name = "settlement_date")
    private LocalDate settlementDate;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.submissionDate == null) this.submissionDate = LocalDate.now();
        if (this.status == null) this.status = ClaimStatus.SUBMITTED;
        if (this.approvedAmount == null) this.approvedAmount = BigDecimal.ZERO;
        if (this.deductibleApplied == null) this.deductibleApplied = BigDecimal.ZERO;
        if (this.copayApplied == null) this.copayApplied = BigDecimal.ZERO;
    }
}
