package com.parking.pbms.controller;

import com.parking.pbms.entity.AllocationRule;
import com.parking.pbms.exception.ConflictException;
import com.parking.pbms.repository.AllocationRuleRepository;
import com.parking.pbms.repository.VehicleTypeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.*;


@RestController
@RequestMapping("/allocation-rules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AllocationRuleController {

    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final UUID DEFAULT_SYSTEM_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");
    private static final Set<String> SUPPORTED_SORT_FIELDS = Set.of("priorityOrder", "createdAt", "updatedAt");

    private final AllocationRuleRepository allocationRuleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @PostMapping
    public ResponseEntity<AllocationRule> createAllocationRule(
            @Valid @RequestBody AllocationRule rule) {
        normalizeAndValidateInput(rule);
        validateTargetAreaProvided(rule);
        validateTimestamps(rule);
        validateBusinessRules(rule, null);

        if (rule.getCreatedBy() == null) {
            rule.setCreatedBy(DEFAULT_SYSTEM_USER_ID);
        }
        if (rule.getUpdatedBy() == null) {
            rule.setUpdatedBy(rule.getCreatedBy());
        }

        AllocationRule saved = allocationRuleRepository.save(rule);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listAllocationRules(
            @RequestParam(required = false) UUID facilityId,
            @RequestParam(required = false) UUID vehicleTypeId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "priorityOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {

        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(pageSize, 1), sort);
        Page<AllocationRule> result = allocationRuleRepository.findWithFilters(
                facilityId,
                vehicleTypeId,
                isBlank(status) ? null : status.trim(),
                pageable);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", result.getContent());
        payload.put("page", result.getNumber());
        payload.put("pageSize", result.getSize());
        payload.put("totalItems", result.getTotalElements());
        payload.put("totalPages", result.getTotalPages());
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/{ruleId}")
    public ResponseEntity<AllocationRule> getAllocationRule(@PathVariable @NonNull UUID ruleId) {
        return allocationRuleRepository.findById(ruleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{ruleId}")
    public ResponseEntity<AllocationRule> updateAllocationRule(
            @PathVariable @NonNull UUID ruleId,
            @Valid @RequestBody AllocationRule updated) {

        AllocationRule existing = allocationRuleRepository.findById(ruleId)
                .orElseThrow(() -> new NoSuchElementException("Allocation rule not found: " + ruleId));

        normalizeAndValidateInput(updated);
        validateTargetAreaProvided(updated);
        validateTimestamps(updated);
        validateBusinessRules(updated, ruleId);

        existing.setFacilityId(updated.getFacilityId());
        existing.setVehicleTypeId(updated.getVehicleTypeId());
        existing.setFloorId(updated.getFloorId());
        existing.setZoneId(updated.getZoneId());
        existing.setPriorityOrder(updated.getPriorityOrder());
        existing.setMaxConcurrentSlots(updated.getMaxConcurrentSlots());
        existing.setOverflowZoneId(updated.getOverflowZoneId());
        existing.setEffectiveFrom(updated.getEffectiveFrom());
        existing.setEffectiveTo(updated.getEffectiveTo());
        existing.setIsDefault(updated.getIsDefault());
        existing.setStatus(updated.getStatus().toLowerCase(Locale.ROOT));
        existing.setNotes(updated.getNotes());
        existing.setUpdatedBy(updated.getUpdatedBy() != null ? updated.getUpdatedBy() : DEFAULT_SYSTEM_USER_ID);

        return ResponseEntity.ok(allocationRuleRepository.save(existing));
    }

    @PatchMapping("/{ruleId}/status")
    public ResponseEntity<AllocationRule> updateAllocationRuleStatus(
            @PathVariable @NonNull UUID ruleId,
            @Valid @RequestBody StatusPatchRequest body) {

        AllocationRule existing = allocationRuleRepository.findById(ruleId)
                .orElseThrow(() -> new NoSuchElementException("Allocation rule not found: " + ruleId));

        String requestedStatus = body.getStatus().trim().toLowerCase(Locale.ROOT);
        validateStatus(requestedStatus);

        // Check if deactivation would leave the vehicle type with no active allocation path
        if (STATUS_ACTIVE.equalsIgnoreCase(existing.getStatus()) && 
            STATUS_INACTIVE.equalsIgnoreCase(requestedStatus)) {
            validateDeactivationAllowed(existing.getFacilityId(), existing.getVehicleTypeId());
        }

        existing.setStatus(requestedStatus);
        existing.setUpdatedBy(body.getUpdatedBy() != null ? body.getUpdatedBy() : DEFAULT_SYSTEM_USER_ID);
        return ResponseEntity.ok(allocationRuleRepository.save(existing));
    }

    private void normalizeAndValidateInput(AllocationRule rule) {
        if (rule.getStatus() != null) {
            rule.setStatus(rule.getStatus().trim().toLowerCase(Locale.ROOT));
        }
        validateStatus(rule.getStatus());
    }

    private void validateStatus(String status) {
        if (!STATUS_ACTIVE.equalsIgnoreCase(status) && !STATUS_INACTIVE.equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Status must be either 'active' or 'inactive'");
        }
    }

    private void validateTargetAreaProvided(AllocationRule rule) {
        if (rule.getFloorId() == null && rule.getZoneId() == null) {
            throw new IllegalArgumentException(
                    "At least one of floorId or zoneId must be provided");
        }
    }

    private void validateTimestamps(AllocationRule rule) {
        if (rule.getEffectiveFrom() != null && rule.getEffectiveTo() != null) {
            if (rule.getEffectiveTo().isBefore(rule.getEffectiveFrom()) ||
                rule.getEffectiveTo().isEqual(rule.getEffectiveFrom())) {
                throw new IllegalArgumentException(
                        "effectiveTo must be after effectiveFrom");
            }
        }
    }

    private void validateBusinessRules(AllocationRule rule, UUID excludeRuleId) {
        // Validate that vehicleTypeId exists
        if (!vehicleTypeRepository.existsById(rule.getVehicleTypeId())) {
            throw new NoSuchElementException("Vehicle type not found: " + rule.getVehicleTypeId());
        }

        // Check for priority conflict
        boolean priorityExists = excludeRuleId == null
                ? allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus(
                rule.getFacilityId(), rule.getVehicleTypeId(), rule.getPriorityOrder(), STATUS_ACTIVE)
                : allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatusAndRuleIdNot(
                rule.getFacilityId(), rule.getVehicleTypeId(), rule.getPriorityOrder(), STATUS_ACTIVE, excludeRuleId);

        if (priorityExists && STATUS_ACTIVE.equalsIgnoreCase(rule.getStatus())) {
            throw new ConflictException("ALLOCATION_PRIORITY_CONFLICT",
                    "Priority order already exists for this vehicle type in the selected facility");
        }

        // Check for default rule conflict
        if (Boolean.TRUE.equals(rule.getIsDefault()) && STATUS_ACTIVE.equalsIgnoreCase(rule.getStatus())) {
            boolean defaultExists = excludeRuleId == null
                    ? allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatus(
                    rule.getFacilityId(), rule.getVehicleTypeId(), STATUS_ACTIVE)
                    : allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatusAndRuleIdNot(
                    rule.getFacilityId(), rule.getVehicleTypeId(), STATUS_ACTIVE, excludeRuleId);

            if (defaultExists) {
                throw new ConflictException("ALLOCATION_DEFAULT_CONFLICT",
                        "A default allocation rule already exists for this vehicle type in the selected facility");
            }
        }
    }

    private void validateDeactivationAllowed(UUID facilityId, UUID vehicleTypeId) {
        long activeCount = allocationRuleRepository.countByFacilityIdAndVehicleTypeIdAndStatus(
                facilityId, vehicleTypeId, STATUS_ACTIVE);

        if (activeCount <= 1) {
            throw new ConflictException("ALLOCATION_DEACTIVATION_BLOCKED",
                    "Vehicle type must have at least one active allocation rule. Deactivation is blocked.");
        }
    }

    private Sort buildSort(String sortBy, String sortDir) {
        String resolvedSortBy = SUPPORTED_SORT_FIELDS.contains(sortBy) ? sortBy : "priorityOrder";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(new Sort.Order(direction, resolvedSortBy).nullsLast());
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusPatchRequest {
        @NotBlank(message = "Status is required")
        private String status;
        private UUID updatedBy;
    }
}
