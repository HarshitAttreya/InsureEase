package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.dto.InvoiceCreateRequestDto;
import com.insureease.insureease_backend.dto.PaymentRecordDto;
import com.insureease.insureease_backend.model.BillingInvoice;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.repository.BillingInvoiceRepository;
import com.insureease.insureease_backend.repository.GroupPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingInvoiceRepository invoiceRepository;
    private final GroupPolicyRepository policyRepository;

    public List<BillingInvoice> getAllInvoices(BillingInvoice.InvoiceStatus status) {
        if (status != null) {
            return invoiceRepository.findByStatus(status);
        }
        return invoiceRepository.findAll();
    }

    public List<BillingInvoice> getInvoicesByPolicy(Long policyId) {
        return invoiceRepository.findByPolicyId(policyId);
    }

    public Optional<BillingInvoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    @Transactional
    public BillingInvoice generateInvoice(InvoiceCreateRequestDto dto) {
        GroupPolicy policy = policyRepository.findById(dto.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + dto.getPolicyId()));

        BigDecimal base = dto.getBaseAmount();
        if (base == null || base.compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal annual = policy.getBaseAnnualPremium() != null ? policy.getBaseAnnualPremium() : new BigDecimal("50000.00");
            base = switch (policy.getBillingFrequency()) {
                case MONTHLY -> annual.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                case QUARTERLY -> annual.divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
                case ANNUAL -> annual;
            };
        }

        BigDecimal taxes = dto.getTaxesAndFees();
        if (taxes == null) {
            taxes = base.multiply(BigDecimal.valueOf(0.045)).setScale(2, RoundingMode.HALF_UP); // 4.5% premium tax
        }
        BigDecimal total = base.add(taxes);

        String invNum = "INV-2025-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        LocalDate due = dto.getDueDate() != null ? dto.getDueDate() : LocalDate.now().plusDays(30);

        String period = dto.getBillingPeriod();
        if (period == null || period.trim().isEmpty()) {
            period = "Period " + LocalDate.now().getMonth().name().substring(0, 3) + " " + LocalDate.now().getYear();
        }

        BillingInvoice invoice = BillingInvoice.builder()
                .invoiceNumber(invNum)
                .policy(policy)
                .billingPeriod(period)
                .issueDate(LocalDate.now())
                .dueDate(due)
                .billedMemberCount(policy.getEnrolledMembersCount() != null ? policy.getEnrolledMembersCount() : 0)
                .baseAmount(base)
                .taxesAndFees(taxes)
                .totalAmount(total)
                .amountPaid(BigDecimal.ZERO)
                .balanceDue(total)
                .status(BillingInvoice.InvoiceStatus.ISSUED)
                .paymentMethod(BillingInvoice.PaymentMethod.NONE)
                .build();

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public BillingInvoice recordPayment(Long invoiceId, PaymentRecordDto dto) {
        BillingInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found with ID: " + invoiceId));

        BigDecimal currentPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(dto.getAmountPaid());
        BigDecimal total = invoice.getTotalAmount();
        BigDecimal balance = total.subtract(newPaid).max(BigDecimal.ZERO);

        invoice.setAmountPaid(newPaid);
        invoice.setBalanceDue(balance);
        invoice.setPaymentMethod(dto.getPaymentMethod());
        invoice.setPaymentDate(dto.getPaymentDate() != null ? dto.getPaymentDate() : LocalDate.now());
        invoice.setPaymentReference(dto.getPaymentReference() != null ? dto.getPaymentReference() : "TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        if (balance.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(BillingInvoice.InvoiceStatus.PAID);
        } else {
            invoice.setStatus(BillingInvoice.InvoiceStatus.PARTIALLY_PAID);
        }

        return invoiceRepository.save(invoice);
    }
}
