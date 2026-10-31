package com.insureease.insureease_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingInvoice {

    public enum InvoiceStatus {
        DRAFT,
        ISSUED,
        PAID,
        PARTIALLY_PAID,
        OVERDUE,
        VOID
    }

    public enum PaymentMethod {
        NONE,
        WIRE_TRANSFER,
        ACH,
        CREDIT_CARD,
        CHECK
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", nullable = false, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "policy_id", nullable = false)
    private GroupPolicy policy;

    @Column(name = "billing_period", nullable = false)
    private String billingPeriod;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "billed_member_count")
    private Integer billedMemberCount;

    @Column(name = "base_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal baseAmount;

    @Column(name = "taxes_and_fees", precision = 10, scale = 2)
    private BigDecimal taxesAndFees;

    @Column(name = "total_amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "balance_due", precision = 12, scale = 2)
    private BigDecimal balanceDue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.issueDate == null) this.issueDate = LocalDate.now();
        if (this.status == null) this.status = InvoiceStatus.ISSUED;
        if (this.taxesAndFees == null) this.taxesAndFees = BigDecimal.ZERO;
        if (this.amountPaid == null) this.amountPaid = BigDecimal.ZERO;
        if (this.balanceDue == null) this.balanceDue = this.totalAmount;
        if (this.paymentMethod == null) this.paymentMethod = PaymentMethod.NONE;
    }
}
