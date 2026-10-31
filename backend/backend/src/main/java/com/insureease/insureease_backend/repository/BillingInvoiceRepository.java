package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.BillingInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingInvoiceRepository extends JpaRepository<BillingInvoice, Long> {
    List<BillingInvoice> findByPolicyId(Long policyId);
    List<BillingInvoice> findByStatus(BillingInvoice.InvoiceStatus status);
    Optional<BillingInvoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM BillingInvoice b WHERE b.status != 'VOID'")
    BigDecimal sumTotalBilled();

    @Query("SELECT COALESCE(SUM(b.amountPaid), 0) FROM BillingInvoice b WHERE b.status != 'VOID'")
    BigDecimal sumTotalPaid();

    @Query("SELECT COALESCE(SUM(b.balanceDue), 0) FROM BillingInvoice b WHERE b.status IN ('ISSUED', 'OVERDUE', 'PARTIALLY_PAID')")
    BigDecimal sumTotalOutstanding();
}
