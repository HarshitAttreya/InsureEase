package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupPolicy {

    public enum ProductType {
        GROUP_HEALTH,
        GROUP_LIFE,
        GROUP_ACCIDENT,
        GROUP_DENTAL,
        GROUP_DISABILITY
    }

    public enum PlanTier {
        BASIC,
        SILVER,
        GOLD,
        PLATINUM
    }

    public enum PolicyStatus {
        DRAFT,
        UNDERWRITING,
        ACTIVE,
        RENEWAL_DUE,
        EXPIRED,
        TERMINATED
    }

    public enum UnderwritingStatus {
        PENDING,
        APPROVED,
        CONDITIONAL,
        REJECTED
    }

    public enum BillingFrequency {
        MONTHLY,
        QUARTERLY,
        ANNUAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_number", nullable = false, unique = true)
    private String policyNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan_tier", nullable = false)
    private PlanTier planTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PolicyStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "underwriting_status", nullable = false)
    private UnderwritingStatus underwritingStatus;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "coverage_per_member", precision = 12, scale = 2)
    private BigDecimal coveragePerMember;

    @Column(name = "deductible_amount", precision = 10, scale = 2)
    private BigDecimal deductibleAmount;

    @Column(name = "copay_percentage")
    private Double copayPercentage; // e.g., 10.0 for 10%

    @Column(name = "base_annual_premium", precision = 12, scale = 2)
    private BigDecimal baseAnnualPremium;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_frequency", nullable = false)
    private BillingFrequency billingFrequency;

    @Column(name = "enrolled_members_count")
    private Integer enrolledMembersCount;

    @Column(name = "loss_ratio")
    private Double lossRatio; // e.g., 65.5%

    @Column(name = "underwriting_notes", length = 1000)
    private String underwritingNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.enrolledMembersCount == null) this.enrolledMembersCount = 0;
        if (this.lossRatio == null) this.lossRatio = 0.0;
        if (this.status == null) this.status = PolicyStatus.DRAFT;
        if (this.underwritingStatus == null) this.underwritingStatus = UnderwritingStatus.PENDING;
        if (this.planTier == null) this.planTier = PlanTier.SILVER;
        if (this.billingFrequency == null) this.billingFrequency = BillingFrequency.ANNUAL;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
