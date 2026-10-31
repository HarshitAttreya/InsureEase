package com.insureease.insureease_backend.repository;

import com.insureease.insureease_backend.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByNameContainingIgnoreCase(String name);
}
