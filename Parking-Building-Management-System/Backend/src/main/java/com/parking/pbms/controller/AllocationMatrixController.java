package com.parking.pbms.controller;

import com.parking.pbms.entity.AllocationRule;
import com.parking.pbms.repository.AllocationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/allocation-matrix")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AllocationMatrixController {

    private final AllocationRuleRepository allocationRuleRepository;

    /**
     * Get the allocation matrix for a facility grouped by vehicle type.
     * GET /api/allocation-matrix?facilityId={facilityId}
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllocationMatrix(
            @RequestParam UUID facilityId) {

        List<AllocationRule> rules = allocationRuleRepository.findAllocationMatrix(facilityId);

        // Group by vehicle type
        Map<UUID, List<AllocationRule>> grouped = rules.stream()
                .collect(Collectors.groupingBy(AllocationRule::getVehicleTypeId));

        Map<String, Object> matrix = new LinkedHashMap<>();
        matrix.put("facilityId", facilityId);
        matrix.put("mappings", grouped);
        matrix.put("totalRules", rules.size());

        return ResponseEntity.ok(matrix);
    }
}
