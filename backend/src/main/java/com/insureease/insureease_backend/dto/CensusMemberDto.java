package com.insureease.insureease_backend.dto;

import com.insureease.insureease_backend.model.CensusMember;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CensusMemberDto {
    private Long id;
    private Long policyId;
    private String memberCode;
    
    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
    
    private String email;
    
    @NotNull
    private LocalDate dateOfBirth;
    
    private String gender;
    private CensusMember.Relationship relationship;
    private CensusMember.CoverageTier coverageTier;
    private LocalDate effectiveDate;
    private CensusMember.MemberStatus status;
    private BigDecimal salary;
    private Boolean preExistingCondition;
}
