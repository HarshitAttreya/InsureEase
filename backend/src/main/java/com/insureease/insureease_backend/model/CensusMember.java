package com.insureease.insureease_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "census_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CensusMember {

    public enum Relationship {
        EMPLOYEE,
        SPOUSE,
        CHILD
    }

    public enum CoverageTier {
        INDIVIDUAL,
        COUPLE,
        FAMILY
    }

    public enum MemberStatus {
        ACTIVE,
        TERMINATED,
        SUSPENDED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    @JsonIgnore
    private GroupPolicy policy;

    @Column(name = "member_code", nullable = false)
    private String memberCode;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String email;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    private String gender; // M, F, OTHER

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Relationship relationship;

    @Enumerated(EnumType.STRING)
    @Column(name = "coverage_tier", nullable = false)
    private CoverageTier coverageTier;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(name = "pre_existing_condition")
    private Boolean preExistingCondition;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.relationship == null) this.relationship = Relationship.EMPLOYEE;
        if (this.coverageTier == null) this.coverageTier = CoverageTier.INDIVIDUAL;
        if (this.status == null) this.status = MemberStatus.ACTIVE;
        if (this.preExistingCondition == null) this.preExistingCondition = false;
    }

    public String getFullName() {
        return this.firstName + " " + this.lastName;
    }
}
