package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.model.*;
import com.insureease.insureease_backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataInitializationService implements CommandLineRunner {

    private final OrganizationRepository orgRepo;
    private final GroupPolicyRepository policyRepo;
    private final CensusMemberRepository memberRepo;
    private final UnderwritingAssessmentRepository underwriteRepo;
    private final RenewalQuoteRepository renewalRepo;
    private final InsuranceClaimRepository claimRepo;
    private final BillingInvoiceRepository invoiceRepo;

    @Override
    public void run(String... args) {
        if (orgRepo.count() == 0) {
            log.info("InsureEase Database is empty. Seeding initial group insurance demo data...");
            seedData();
            log.info("InsureEase Database seeded successfully!");
        }
    }

    @Transactional
    public void seedData() {
        // Clear in proper foreign key order using in-batch deletes
        claimRepo.deleteAllInBatch();
        invoiceRepo.deleteAllInBatch();
        renewalRepo.deleteAllInBatch();
        underwriteRepo.deleteAllInBatch();
        memberRepo.deleteAllInBatch();
        policyRepo.deleteAllInBatch();
        orgRepo.deleteAllInBatch();

        // 1. Create Corporate Organizations
        Organization apex = orgRepo.save(Organization.builder()
                .name("Apex Cloud Systems Inc.")
                .registrationNumber("ORG-US-948102")
                .industry("Information Technology & Cloud")
                .contactPerson("Sarah Jenkins")
                .contactEmail("s.jenkins@apexcloud.io")
                .contactPhone("+1 (415) 890-1234")
                .address("101 Market Street, San Francisco, CA")
                .employeeCount(420)
                .industryRiskFactor(0.92) // low hazard tech
                .build());

        Organization nexus = orgRepo.save(Organization.builder()
                .name("Nexus Logistics & Haulage Corp")
                .registrationNumber("ORG-US-772911")
                .industry("Transportation & Heavy Freight")
                .contactPerson("Marcus Vance")
                .contactEmail("mvance@nexushaulage.com")
                .contactPhone("+1 (312) 555-8910")
                .address("500 Logistics Parkway, Chicago, IL")
                .employeeCount(850)
                .industryRiskFactor(1.35) // higher risk hazard
                .build());

        Organization beacon = orgRepo.save(Organization.builder()
                .name("Beacon Health & Biosciences")
                .registrationNumber("ORG-US-482019")
                .industry("Biotech & Life Sciences")
                .contactPerson("Dr. Elena Rostova")
                .contactEmail("elena.r@beaconbio.org")
                .contactPhone("+1 (617) 443-9000")
                .address("200 Discovery Way, Cambridge, MA")
                .employeeCount(280)
                .industryRiskFactor(1.05)
                .build());

        Organization skyline = orgRepo.save(Organization.builder()
                .name("Skyline Hotels & Hospitality")
                .registrationNumber("ORG-US-318490")
                .industry("Hospitality & Leisure")
                .contactPerson("Carlos Mendoza")
                .contactEmail("c.mendoza@skylinehotels.com")
                .contactPhone("+1 (305) 774-2231")
                .address("77 Ocean Drive, Miami, FL")
                .employeeCount(600)
                .industryRiskFactor(1.10)
                .build());

        // 2. Create Group Policies
        LocalDate today = LocalDate.now();

        // Policy 1: Apex Health (Active, good loss ratio)
        GroupPolicy p1 = policyRepo.save(GroupPolicy.builder()
                .policyNumber("GHL-2025-1049")
                .organization(apex)
                .productType(GroupPolicy.ProductType.GROUP_HEALTH)
                .planTier(GroupPolicy.PlanTier.GOLD)
                .status(GroupPolicy.PolicyStatus.ACTIVE)
                .underwritingStatus(GroupPolicy.UnderwritingStatus.APPROVED)
                .startDate(today.minusMonths(6))
                .endDate(today.plusMonths(6))
                .coveragePerMember(new BigDecimal("500000.00"))
                .deductibleAmount(new BigDecimal("500.00"))
                .copayPercentage(10.0)
                .baseAnnualPremium(new BigDecimal("380000.00"))
                .billingFrequency(GroupPolicy.BillingFrequency.QUARTERLY)
                .enrolledMembersCount(0)
                .lossRatio(0.0)
                .underwritingNotes("Standard corporate health tier with dental and vision rider. Approved with zero exclusion.")
                .build());

        // Policy 2: Nexus Logistics Accidental & Life (Renewal Due, higher claims)
        GroupPolicy p2 = policyRepo.save(GroupPolicy.builder()
                .policyNumber("GAC-2025-4421")
                .organization(nexus)
                .productType(GroupPolicy.ProductType.GROUP_ACCIDENT)
                .planTier(GroupPolicy.PlanTier.PLATINUM)
                .status(GroupPolicy.PolicyStatus.RENEWAL_DUE)
                .underwritingStatus(GroupPolicy.UnderwritingStatus.APPROVED)
                .startDate(today.minusMonths(11))
                .endDate(today.plusDays(30)) // expiring in 30 days!
                .coveragePerMember(new BigDecimal("350000.00"))
                .deductibleAmount(new BigDecimal("250.00"))
                .copayPercentage(15.0)
                .baseAnnualPremium(new BigDecimal("520000.00"))
                .billingFrequency(GroupPolicy.BillingFrequency.ANNUAL)
                .enrolledMembersCount(0)
                .lossRatio(0.0)
                .underwritingNotes("Commercial fleet drivers and warehouse operators. Premium loading applied (+12%).")
                .build());

        // Policy 3: Beacon Health Group Term Life (Underwriting Pending Review)
        GroupPolicy p3 = policyRepo.save(GroupPolicy.builder()
                .policyNumber("GLF-2025-8832")
                .organization(beacon)
                .productType(GroupPolicy.ProductType.GROUP_LIFE)
                .planTier(GroupPolicy.PlanTier.GOLD)
                .status(GroupPolicy.PolicyStatus.UNDERWRITING)
                .underwritingStatus(GroupPolicy.UnderwritingStatus.PENDING)
                .startDate(today.plusDays(15))
                .endDate(today.plusYears(1).plusDays(15))
                .coveragePerMember(new BigDecimal("750000.00"))
                .deductibleAmount(BigDecimal.ZERO)
                .copayPercentage(0.0)
                .baseAnnualPremium(new BigDecimal("240000.00"))
                .billingFrequency(GroupPolicy.BillingFrequency.ANNUAL)
                .enrolledMembersCount(0)
                .lossRatio(0.0)
                .underwritingNotes("New submission: 280 executive and lab bioscience research personnel.")
                .build());

        // Policy 4: Skyline Dental & Vision (Active)
        GroupPolicy p4 = policyRepo.save(GroupPolicy.builder()
                .policyNumber("GDN-2025-6301")
                .organization(skyline)
                .productType(GroupPolicy.ProductType.GROUP_DENTAL)
                .planTier(GroupPolicy.PlanTier.SILVER)
                .status(GroupPolicy.PolicyStatus.ACTIVE)
                .underwritingStatus(GroupPolicy.UnderwritingStatus.APPROVED)
                .startDate(today.minusMonths(3))
                .endDate(today.plusMonths(9))
                .coveragePerMember(new BigDecimal("50000.00"))
                .deductibleAmount(new BigDecimal("100.00"))
                .copayPercentage(20.0)
                .baseAnnualPremium(new BigDecimal("115000.00"))
                .billingFrequency(GroupPolicy.BillingFrequency.MONTHLY)
                .enrolledMembersCount(0)
                .lossRatio(0.0)
                .underwritingNotes("Annual preventive and corrective dental coverage for frontline hospitality staff.")
                .build());

        // 3. Populate Census Members
        // For Apex
        CensusMember m1 = memberRepo.save(CensusMember.builder()
                .policy(p1)
                .memberCode("APX-101")
                .firstName("David")
                .lastName("Chen")
                .email("d.chen@apexcloud.io")
                .dateOfBirth(LocalDate.of(1988, 4, 12))
                .gender("M")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.FAMILY)
                .effectiveDate(p1.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("165000.00"))
                .preExistingCondition(false)
                .build());

        CensusMember m2 = memberRepo.save(CensusMember.builder()
                .policy(p1)
                .memberCode("APX-102")
                .firstName("Emily")
                .lastName("Taylor")
                .email("e.taylor@apexcloud.io")
                .dateOfBirth(LocalDate.of(1992, 9, 23))
                .gender("F")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.INDIVIDUAL)
                .effectiveDate(p1.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("140000.00"))
                .preExistingCondition(false)
                .build());

        CensusMember m3 = memberRepo.save(CensusMember.builder()
                .policy(p1)
                .memberCode("APX-103")
                .firstName("Michael")
                .lastName("Kowalski")
                .email("m.kowalski@apexcloud.io")
                .dateOfBirth(LocalDate.of(1982, 11, 5))
                .gender("M")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.COUPLE)
                .effectiveDate(p1.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("178000.00"))
                .preExistingCondition(true)
                .build());

        // For Nexus
        CensusMember m4 = memberRepo.save(CensusMember.builder()
                .policy(p2)
                .memberCode("NEX-501")
                .firstName("Robert")
                .lastName("O'Connor")
                .email("robert.oc@nexushaulage.com")
                .dateOfBirth(LocalDate.of(1979, 3, 18))
                .gender("M")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.INDIVIDUAL)
                .effectiveDate(p2.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("78000.00"))
                .preExistingCondition(false)
                .build());

        CensusMember m5 = memberRepo.save(CensusMember.builder()
                .policy(p2)
                .memberCode("NEX-502")
                .firstName("Samantha")
                .lastName("Miller")
                .email("smiller@nexushaulage.com")
                .dateOfBirth(LocalDate.of(1985, 7, 30))
                .gender("F")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.FAMILY)
                .effectiveDate(p2.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("82000.00"))
                .preExistingCondition(false)
                .build());

        // For Beacon
        CensusMember m6 = memberRepo.save(CensusMember.builder()
                .policy(p3)
                .memberCode("BCN-010")
                .firstName("Dr. Arthur")
                .lastName("Pendleton")
                .email("a.pendleton@beaconbio.org")
                .dateOfBirth(LocalDate.of(1975, 1, 14))
                .gender("M")
                .relationship(CensusMember.Relationship.EMPLOYEE)
                .coverageTier(CensusMember.CoverageTier.FAMILY)
                .effectiveDate(p3.getStartDate())
                .status(CensusMember.MemberStatus.ACTIVE)
                .salary(new BigDecimal("210000.00"))
                .preExistingCondition(false)
                .build());

        // Update counts
        p1.setEnrolledMembersCount(3);
        p2.setEnrolledMembersCount(2);
        p3.setEnrolledMembersCount(1);
        p4.setEnrolledMembersCount(1);
        policyRepo.saveAll(List.of(p1, p2, p3, p4));

        // 4. Create Underwriting Assessment for Beacon (Pending Case)
        underwriteRepo.save(UnderwritingAssessment.builder()
                .policy(p3)
                .assessedAt(LocalDateTime.now().minusDays(2))
                .underwriterName("Senior Risk Analyst J. Reynolds")
                .overallRiskScore(48.5)
                .industryHazardScore(47.25)
                .demographicRiskScore(50.0)
                .claimsHistoryFactor(0.0)
                .recommendedLoadingPct(0.0)
                .decision(UnderwritingAssessment.Decision.PENDING)
                .decisionNotes("Group demographic is mature with zero hazardous work environments. Standard underwriting guidelines satisfied.")
                .specialConditions("Standard laboratory safety protocols must be maintained.")
                .build());

        // 5. Create Renewal Quote for Nexus (Expiring in 30 days)
        renewalRepo.save(RenewalQuote.builder()
                .policy(p2)
                .renewalYear(today.getYear() + 1)
                .previousAnnualPremium(new BigDecimal("520000.00"))
                .proposedAnnualPremium(new BigDecimal("561600.00"))
                .rateAdjustmentPct(8.0)
                .lossRatioExperience(71.5)
                .status(RenewalQuote.RenewalStatus.QUOTED)
                .expiryDate(p2.getEndDate())
                .quoteValidUntil(p2.getEndDate().minusDays(5))
                .notes("Proposed 8.0% adjustment driven by freight yard accident claim frequency over current policy year.")
                .build());

        // 6. Create Claims
        // Settled Claim 1 for Apex
        claimRepo.save(InsuranceClaim.builder()
                .claimNumber("CLM-2025-0104")
                .policy(p1)
                .member(m1)
                .claimType(InsuranceClaim.ClaimType.HOSPITALIZATION)
                .incidentDate(today.minusMonths(2))
                .submissionDate(today.minusMonths(2).plusDays(2))
                .claimedAmount(new BigDecimal("18500.00"))
                .deductibleApplied(new BigDecimal("500.00"))
                .copayApplied(new BigDecimal("1800.00"))
                .approvedAmount(new BigDecimal("16200.00"))
                .healthcareProvider("San Francisco General Hospital")
                .diagnosis("Laparoscopic appendectomy and 2-day postoperative recovery")
                .status(InsuranceClaim.ClaimStatus.SETTLED)
                .adjudicationNotes("Verified emergency surgical admission. Deductible and 10% copay applied per Gold tier terms.")
                .settlementDate(today.minusMonths(1).minusDays(10))
                .paymentReference("PAY-SF-99214")
                .build());

        // Settled Claim 2 for Nexus
        claimRepo.save(InsuranceClaim.builder()
                .claimNumber("CLM-2025-0219")
                .policy(p2)
                .member(m4)
                .claimType(InsuranceClaim.ClaimType.ACCIDENT)
                .incidentDate(today.minusMonths(4))
                .submissionDate(today.minusMonths(4).plusDays(3))
                .claimedAmount(new BigDecimal("42000.00"))
                .deductibleApplied(new BigDecimal("250.00"))
                .copayApplied(new BigDecimal("6262.50"))
                .approvedAmount(new BigDecimal("35487.50"))
                .healthcareProvider("Midwest Orthopedic Trauma Center")
                .diagnosis("Fractured fibula and ankle stabilization following loading dock incident")
                .status(InsuranceClaim.ClaimStatus.SETTLED)
                .adjudicationNotes("Occupational accident confirmed. Approved under Platinum Accident Coverage rider.")
                .settlementDate(today.minusMonths(3))
                .paymentReference("PAY-MW-38291")
                .build());

        // In Review Claim 3 for Apex
        claimRepo.save(InsuranceClaim.builder()
                .claimNumber("CLM-2025-0450")
                .policy(p1)
                .member(m3)
                .claimType(InsuranceClaim.ClaimType.SURGERY)
                .incidentDate(today.minusDays(8))
                .submissionDate(today.minusDays(5))
                .claimedAmount(new BigDecimal("12400.00"))
                .deductibleApplied(BigDecimal.ZERO)
                .copayApplied(new BigDecimal("1240.00"))
                .approvedAmount(new BigDecimal("11160.00"))
                .healthcareProvider("Stanford Health Care")
                .diagnosis("Rotator cuff repair arthroscopy")
                .status(InsuranceClaim.ClaimStatus.UNDER_REVIEW)
                .adjudicationNotes("Awaiting pre-operative medical records and orthopedic surgeon operative notes.")
                .build());

        // Update Loss Ratios for Policies
        p1.setLossRatio(4.26); // $16,200 / $380,000 = 4.26%
        p2.setLossRatio(6.82); // $35,487.50 / $520,000 = 6.82%
        policyRepo.saveAll(List.of(p1, p2));

        // 7. Create Billing Invoices
        // Apex Paid Invoice
        invoiceRepo.save(BillingInvoice.builder()
                .invoiceNumber("INV-2025-1001")
                .policy(p1)
                .billingPeriod("Q1 2025 Premium")
                .issueDate(today.minusMonths(6))
                .dueDate(today.minusMonths(5))
                .billedMemberCount(3)
                .baseAmount(new BigDecimal("95000.00"))
                .taxesAndFees(new BigDecimal("4275.00"))
                .totalAmount(new BigDecimal("99275.00"))
                .amountPaid(new BigDecimal("99275.00"))
                .balanceDue(BigDecimal.ZERO)
                .status(BillingInvoice.InvoiceStatus.PAID)
                .paymentMethod(BillingInvoice.PaymentMethod.WIRE_TRANSFER)
                .paymentDate(today.minusMonths(5).minusDays(3))
                .paymentReference("WIRE-BOA-882901")
                .build());

        // Apex Current Issued Invoice (Due next month)
        invoiceRepo.save(BillingInvoice.builder()
                .invoiceNumber("INV-2025-1045")
                .policy(p1)
                .billingPeriod("Q2 2025 Premium")
                .issueDate(today.minusDays(10))
                .dueDate(today.plusDays(20))
                .billedMemberCount(3)
                .baseAmount(new BigDecimal("95000.00"))
                .taxesAndFees(new BigDecimal("4275.00"))
                .totalAmount(new BigDecimal("99275.00"))
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(new BigDecimal("99275.00"))
                .status(BillingInvoice.InvoiceStatus.ISSUED)
                .paymentMethod(BillingInvoice.PaymentMethod.NONE)
                .build());

        // Nexus Annual Invoice (Overdue notice)
        invoiceRepo.save(BillingInvoice.builder()
                .invoiceNumber("INV-2025-0812")
                .policy(p2)
                .billingPeriod("2024-2025 Annual Installment 2")
                .issueDate(today.minusMonths(2))
                .dueDate(today.minusDays(15))
                .billedMemberCount(2)
                .baseAmount(new BigDecimal("260000.00"))
                .taxesAndFees(new BigDecimal("11700.00"))
                .totalAmount(new BigDecimal("271700.00"))
                .amountPaid(new BigDecimal("100000.00"))
                .balanceDue(new BigDecimal("171700.00"))
                .status(BillingInvoice.InvoiceStatus.OVERDUE)
                .paymentMethod(BillingInvoice.PaymentMethod.ACH)
                .paymentDate(today.minusMonths(1))
                .paymentReference("ACH-CHASE-77112")
                .build());
    }
}
