package com.parking.pbms.controller;

import com.parking.pbms.entity.VehicleType;
import com.parking.pbms.exception.ConflictException;
import com.parking.pbms.repository.ParkingSessionRepository;
import com.parking.pbms.repository.VehicleTypeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleTypeController {

    private static final Pattern CODE_PATTERN = Pattern.compile("^[A-Z0-9_]{2,30}$");
    private static final String STATUS_ACTIVE = "active";
    private static final String STATUS_INACTIVE = "inactive";
    private static final UUID DEFAULT_USER = UUID.fromString("00000000-0000-0000-0000-000000000000");

    private final VehicleTypeRepository vehicleTypeRepository;
    private final ParkingSessionRepository parkingSessionRepository;

    @PostMapping("/vehicle-types")
    public ResponseEntity<VehicleType> createVehicleType(@Valid @RequestBody VehicleType vehicleType) {
        normalizeAndValidateInput(vehicleType);
        validateUniquenessForCreate(vehicleType);

        if (vehicleType.getCreatedBy() == null) {
            vehicleType.setCreatedBy(DEFAULT_USER);
        }
        if (vehicleType.getUpdatedBy() == null) {
            vehicleType.setUpdatedBy(vehicleType.getCreatedBy());
        }

        VehicleType saved = vehicleTypeRepository.save(vehicleType);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/vehicle-types")
    public ResponseEntity<Map<String, Object>> listVehicleTypes(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "priorityOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize
    ) {
        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(pageSize, 1), sort);
        Page<VehicleType> result = vehicleTypeRepository.findWithFilters(
                isBlank(status) ? null : status.trim(),
                isBlank(search) ? null : search.trim(),
                pageable
        );

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", result.getContent());
        payload.put("page", result.getNumber());
        payload.put("pageSize", result.getSize());
        payload.put("totalItems", result.getTotalElements());
        payload.put("totalPages", result.getTotalPages());
        return ResponseEntity.ok(payload);
    }

    @GetMapping("/vehicle-types/{vehicleTypeId}")
    public ResponseEntity<VehicleType> getVehicleType(@PathVariable @NonNull UUID vehicleTypeId) {
        return vehicleTypeRepository.findById(vehicleTypeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/vehicle-types/{vehicleTypeId}")
    public ResponseEntity<VehicleType> updateVehicleType(@PathVariable @NonNull UUID vehicleTypeId,
                                                         @Valid @RequestBody VehicleType updated) {
        VehicleType existing = vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new NoSuchElementException("Vehicle type not found: " + vehicleTypeId));

        normalizeAndValidateInput(updated);
        validateUniquenessForUpdate(vehicleTypeId, updated);
        validateDeactivationRule(existing.getVehicleTypeId(), existing.getStatus(), updated.getStatus());

        existing.setCode(updated.getCode());
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setWheelCount(updated.getWheelCount());
        existing.setMaxHeightCm(updated.getMaxHeightCm());
        existing.setMaxWidthCm(updated.getMaxWidthCm());
        existing.setMaxLengthCm(updated.getMaxLengthCm());
        existing.setDefaultAllocationRuleId(updated.getDefaultAllocationRuleId());
        existing.setDefaultPricingPolicyId(updated.getDefaultPricingPolicyId());
        existing.setRequiresManualApproval(Boolean.TRUE.equals(updated.getRequiresManualApproval()));
        existing.setPriorityOrder(updated.getPriorityOrder());
        existing.setStatus(updated.getStatus().toLowerCase(Locale.ROOT));
        existing.setUpdatedBy(updated.getUpdatedBy() != null ? updated.getUpdatedBy() : DEFAULT_USER);

        return ResponseEntity.ok(vehicleTypeRepository.save(existing));
    }

    @PatchMapping("/vehicle-types/{vehicleTypeId}/status")
    public ResponseEntity<VehicleType> updateVehicleTypeStatus(@PathVariable @NonNull UUID vehicleTypeId,
                                                               @Valid @RequestBody StatusPatchRequest body) {
        VehicleType existing = vehicleTypeRepository.findById(vehicleTypeId)
                .orElseThrow(() -> new NoSuchElementException("Vehicle type not found: " + vehicleTypeId));

        String requestedStatus = body.getStatus().trim().toLowerCase(Locale.ROOT);
        validateStatus(requestedStatus);
        validateDeactivationRule(existing.getVehicleTypeId(), existing.getStatus(), requestedStatus);

        existing.setStatus(requestedStatus);
        existing.setUpdatedBy(body.getUpdatedBy() != null ? body.getUpdatedBy() : DEFAULT_USER);
        return ResponseEntity.ok(vehicleTypeRepository.save(existing));
    }

    @GetMapping("/public/vehicle-types")
    public ResponseEntity<List<VehicleType>> listPublicActiveVehicleTypes() {
        List<VehicleType> activeTypes = vehicleTypeRepository.findByStatusIgnoreCase(STATUS_ACTIVE);
        activeTypes.sort((a, b) -> {
            Comparator<Integer> nullableIntComparator = Comparator.nullsLast(Comparator.naturalOrder());
            int byPriority = nullableIntComparator.compare(a.getPriorityOrder(), b.getPriorityOrder());
            if (byPriority != 0) {
                return byPriority;
            }
            return a.getName().compareToIgnoreCase(b.getName());
        });
        return ResponseEntity.ok(activeTypes);
    }

    private void normalizeAndValidateInput(VehicleType vehicleType) {
        if (vehicleType.getCode() != null) {
            vehicleType.setCode(vehicleType.getCode().trim());
        }
        if (vehicleType.getName() != null) {
            vehicleType.setName(vehicleType.getName().trim());
        }
        if (vehicleType.getStatus() != null) {
            vehicleType.setStatus(vehicleType.getStatus().trim().toLowerCase(Locale.ROOT));
        }
        vehicleType.setRequiresManualApproval(Boolean.TRUE.equals(vehicleType.getRequiresManualApproval()));

        validateCode(vehicleType.getCode());
        validateStatus(vehicleType.getStatus());
    }

    private void validateCode(String code) {
        if (isBlank(code) || !CODE_PATTERN.matcher(code).matches()) {
            throw new IllegalArgumentException("Code must match regex ^[A-Z0-9_]{2,30}$");
        }
    }

    private void validateStatus(String status) {
        if (!STATUS_ACTIVE.equalsIgnoreCase(status) && !STATUS_INACTIVE.equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Status must be either 'active' or 'inactive'");
        }
    }

    private void validateUniquenessForCreate(VehicleType vehicleType) {
        if (vehicleTypeRepository.existsByCodeIgnoreCase(vehicleType.getCode())) {
            throw new ConflictException("Vehicle type code already exists: " + vehicleType.getCode());
        }
        validateActiveNameAndPriorityUniqueness(null, vehicleType.getName(), vehicleType.getPriorityOrder(), vehicleType.getStatus());
    }

    private void validateUniquenessForUpdate(UUID vehicleTypeId, VehicleType vehicleType) {
        if (vehicleTypeRepository.existsByCodeIgnoreCaseAndVehicleTypeIdNot(vehicleType.getCode(), vehicleTypeId)) {
            throw new ConflictException("Vehicle type code already exists: " + vehicleType.getCode());
        }
        validateActiveNameAndPriorityUniqueness(vehicleTypeId, vehicleType.getName(), vehicleType.getPriorityOrder(), vehicleType.getStatus());
    }

    private void validateActiveNameAndPriorityUniqueness(UUID vehicleTypeId, String name, Integer priorityOrder, String status) {
        if (!STATUS_ACTIVE.equalsIgnoreCase(status)) {
            return;
        }

        boolean duplicateActiveName = vehicleTypeId == null
                ? vehicleTypeRepository.existsByNameIgnoreCaseAndStatusIgnoreCase(name, STATUS_ACTIVE)
                : vehicleTypeRepository.existsByNameIgnoreCaseAndStatusIgnoreCaseAndVehicleTypeIdNot(name, STATUS_ACTIVE, vehicleTypeId);
        if (duplicateActiveName) {
            throw new ConflictException("Vehicle type name already exists among active vehicle types: " + name);
        }

        if (priorityOrder != null) {
            boolean duplicatePriority = vehicleTypeId == null
                    ? vehicleTypeRepository.existsByPriorityOrderAndStatusIgnoreCase(priorityOrder, STATUS_ACTIVE)
                    : vehicleTypeRepository.existsByPriorityOrderAndStatusIgnoreCaseAndVehicleTypeIdNot(priorityOrder, STATUS_ACTIVE, vehicleTypeId);
            if (duplicatePriority) {
                throw new ConflictException("Priority order must be unique among active vehicle types: " + priorityOrder);
            }
        }
    }

    private void validateDeactivationRule(UUID vehicleTypeId, String currentStatus, String nextStatus) {
        if (!STATUS_ACTIVE.equalsIgnoreCase(currentStatus) || !STATUS_INACTIVE.equalsIgnoreCase(nextStatus)) {
            return;
        }

        if (parkingSessionRepository.existsByVehicleTypeIdAndStatusIgnoreCase(vehicleTypeId, STATUS_ACTIVE)) {
            throw new ConflictException("Vehicle type cannot be deactivated while active sessions exist.");
        }

        long activeCount = vehicleTypeRepository.countByStatusIgnoreCase(STATUS_ACTIVE);
        if (activeCount <= 1) {
            throw new ConflictException("At least one active vehicle type must always exist.");
        }
    }

    private Sort buildSort(String sortBy, String sortDir) {
        Set<String> supportedSortFields = Set.of("priorityOrder", "name", "updatedAt");
        String resolvedSortBy = supportedSortFields.contains(sortBy) ? sortBy : "priorityOrder";
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
