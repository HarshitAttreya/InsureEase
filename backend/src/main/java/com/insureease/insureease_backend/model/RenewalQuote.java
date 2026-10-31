package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "renewal_quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RenewalQuote {

    public enum RenewalStatus {
        UPCOMING,
        QUOTED,
        NEGOTIATING,
        ACCEPTED,
        DECLINED,
        BOUND
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private GroupPolicy policy;

    @Column(name = "renewal_year", nullable = false)
    private Integer renewalYear;

    @Column(name = "previous_annual_premium", precision = 12, scale = 2)
    private BigDecimal previousAnnualPremium;

    @Column(name = "proposed_annual_premium", precision = 12, scale = 2)
    private BigDecimal proposedAnnualPremium;

    @Column(name = "rate_adjustment_pct")
    private Double rateAdjustmentPct;

    @Column(name = "loss_ratio_experience")
    private Double lossRatioExperience;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RenewalStatus status;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "quote_valid_until")
    private LocalDate quoteValidUntil;

    @Column(length = 1000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = RenewalStatus.UPCOMING;
    }
}
