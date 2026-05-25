package com.parking.pbms.controller;

import com.parking.pbms.entity.ParkingFacility;
import com.parking.pbms.repository.ParkingFacilityRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.lang.NonNull;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Cross-origin safety override for development
public class FacilityController {

    private final ParkingFacilityRepository facilityRepository;

    @PostMapping
    public ResponseEntity<ParkingFacility> createFacility(@Valid @RequestBody ParkingFacility facility) {
        // Enforce basic business uniqueness
        if (facilityRepository.existsByFacilityCode(facility.getFacilityCode())) {
            throw new IllegalArgumentException("Facility code already exists: " + facility.getFacilityCode());
        }
        
        // Mock audit author mapping (e.g. system user UUID)
        UUID defaultUser = UUID.fromString("00000000-0000-0000-0000-000000000000");
        if (facility.getCreatedBy() == null) facility.setCreatedBy(defaultUser);
        if (facility.getUpdatedBy() == null) facility.setUpdatedBy(defaultUser);

        ParkingFacility saved = facilityRepository.save(facility);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ParkingFacility>> listFacilities() {
        return ResponseEntity.ok(facilityRepository.findAll());
    }

    @GetMapping("/{facilityId}")
    public ResponseEntity<ParkingFacility> getFacility(@PathVariable @NonNull UUID facilityId) {
        return facilityRepository.findById(facilityId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
