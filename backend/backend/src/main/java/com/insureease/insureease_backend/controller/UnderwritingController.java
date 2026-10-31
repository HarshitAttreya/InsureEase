package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.dto.UnderwritingDecisionDto;
import com.insureease.insureease_backend.model.UnderwritingAssessment;
import com.insureease.insureease_backend.service.UnderwritingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/underwriting")
@RequiredArgsConstructor
public class UnderwritingController {

    private final UnderwritingService underwritingService;

    @GetMapping
    public ResponseEntity<List<UnderwritingAssessment>> getAllAssessments() {
        return ResponseEntity.ok(underwritingService.getAllAssessments());
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<UnderwritingAssessment> getAssessmentByPolicy(@PathVariable Long policyId) {
        return underwritingService.getAssessmentByPolicyId(policyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/policy/{policyId}/evaluate")
    public ResponseEntity<UnderwritingAssessment> evaluateRisk(@PathVariable Long policyId) {
        return ResponseEntity.ok(underwritingService.evaluatePolicyRisk(policyId));
    }

    @PostMapping("/decision")
    public ResponseEntity<UnderwritingAssessment> submitDecision(@Valid @RequestBody UnderwritingDecisionDto dto) {
        return ResponseEntity.ok(underwritingService.submitDecision(dto));
    }
}
