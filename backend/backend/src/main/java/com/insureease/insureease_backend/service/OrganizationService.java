package com.insureease.insureease_backend.service;

import com.insureease.insureease_backend.model.Organization;
import com.insureease.insureease_backend.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public List<Organization> getAllOrganizations(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return organizationRepository.findByNameContainingIgnoreCase(search.trim());
        }
        return organizationRepository.findAll();
    }

    public Optional<Organization> getOrganizationById(Long id) {
        return organizationRepository.findById(id);
    }

    public Organization saveOrganization(Organization org) {
        return organizationRepository.save(org);
    }

    public void deleteOrganization(Long id) {
        organizationRepository.deleteById(id);
    }
}
