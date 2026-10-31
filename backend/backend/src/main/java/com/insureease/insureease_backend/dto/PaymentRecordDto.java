package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.BillingInvoice;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRecordDto {
    @NotNull
    private BigDecimal amountPaid;
    
    @NotNull
    private BillingInvoice.PaymentMethod paymentMethod;
    
    private LocalDate paymentDate;
    private String paymentReference;
}
