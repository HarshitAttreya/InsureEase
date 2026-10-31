package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    private String industry;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    private String address;

    @Column(name = "employee_count")
    private Integer employeeCount;

    @Column(name = "industry_risk_factor")
    private Double industryRiskFactor; // e.g. 1.0 (average), 1.25 (mining/hazards), 0.9 (tech/office)

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.industryRiskFactor == null) {
            this.industryRiskFactor = 1.0;
        }
    }
}
