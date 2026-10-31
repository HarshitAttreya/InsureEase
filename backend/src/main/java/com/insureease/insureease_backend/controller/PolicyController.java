package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.dto.CensusMemberDto;
import com.insureease.insureease_backend.dto.PolicyCreateRequestDto;
import com.insureease.insureease_backend.model.CensusMember;
import com.insureease.insureease_backend.model.GroupPolicy;
import com.insureease.insureease_backend.service.PolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;

    @GetMapping
    public ResponseEntity<List<GroupPolicy>> getAllPolicies(
            @RequestParam(required = false) GroupPolicy.PolicyStatus status,
            @RequestParam(required = false) GroupPolicy.ProductType productType) {
        return ResponseEntity.ok(policyService.getAllPolicies(status, productType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupPolicy> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GroupPolicy> createPolicy(@Valid @RequestBody PolicyCreateRequestDto dto) {
        return ResponseEntity.ok(policyService.createPolicy(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupPolicy> updatePolicy(@PathVariable Long id, @RequestBody GroupPolicy policy) {
        return ResponseEntity.ok(policyService.updatePolicy(id, policy));
    }

    @GetMapping("/{id}/census")
    public ResponseEntity<List<CensusMember>> getCensusMembers(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getCensusMembers(id));
    }

    @PostMapping("/{id}/census")
    public ResponseEntity<CensusMember> addCensusMember(
            @PathVariable Long id,
            @Valid @RequestBody CensusMemberDto dto) {
        return ResponseEntity.ok(policyService.addCensusMember(id, dto));
    }
}
