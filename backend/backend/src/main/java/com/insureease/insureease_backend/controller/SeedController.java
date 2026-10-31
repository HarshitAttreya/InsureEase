package com.insureease.insureease_backend.controller;

import com.insureease.insureease_backend.service.DataInitializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final DataInitializationService dataInitializationService;

    @PostMapping("/reset")
    public ResponseEntity<Map<String, String>> resetAndSeed() {
        dataInitializationService.seedData();
        return ResponseEntity.ok(Map.of("message", "Database successfully reset and seeded with initial demo data!"));
    }
}
