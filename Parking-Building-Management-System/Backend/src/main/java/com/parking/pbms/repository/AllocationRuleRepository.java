package com.parking.pbms.repository;

import com.parking.pbms.entity.AllocationRule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AllocationRuleRepository extends JpaRepository<AllocationRule, UUID> {

    /**
     * Check if a priority order already exists for a specific vehicle type and facility.
     */
    boolean existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus(
            UUID facilityId, UUID vehicleTypeId, Integer priorityOrder, String status);

    /**
     * Check if a priority order already exists, excluding a specific rule ID.
     */
    boolean existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatusAndRuleIdNot(
            UUID facilityId, UUID vehicleTypeId, Integer priorityOrder, String status, UUID ruleId);

    /**
     * Check if a default rule already exists for a vehicle type and facility.
     */
    boolean existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatus(
            UUID facilityId, UUID vehicleTypeId, String status);

    /**
     * Check if a default rule already exists, excluding a specific rule ID.
     */
    boolean existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatusAndRuleIdNot(
            UUID facilityId, UUID vehicleTypeId, String status, UUID ruleId);

    /**
     * Count active allocation rules for a specific vehicle type in a facility.
     */
    long countByFacilityIdAndVehicleTypeIdAndStatus(UUID facilityId, UUID vehicleTypeId, String status);

    /**
     * Find all rules for a vehicle type in a facility with pagination.
     */
    @Query("""
            SELECT a FROM AllocationRule a
            WHERE (:facilityId IS NULL OR a.facilityId = :facilityId)
              AND (:vehicleTypeId IS NULL OR a.vehicleTypeId = :vehicleTypeId)
              AND (:status IS NULL OR LOWER(a.status) = LOWER(:status))
            ORDER BY a.priorityOrder ASC
            """)
    Page<AllocationRule> findWithFilters(
            @Param("facilityId") UUID facilityId,
            @Param("vehicleTypeId") UUID vehicleTypeId,
            @Param("status") String status,
            Pageable pageable);

    /**
     * Find all active rules for a vehicle type in a facility.
     */
    @Query("""
            SELECT a FROM AllocationRule a
            WHERE a.facilityId = :facilityId
              AND a.vehicleTypeId = :vehicleTypeId
              AND LOWER(a.status) = 'active'
            ORDER BY a.priorityOrder ASC
            """)
    List<AllocationRule> findActiveRulesByFacilityAndVehicleType(
            @Param("facilityId") UUID facilityId,
            @Param("vehicleTypeId") UUID vehicleTypeId);

    /**
     * Get the allocation matrix for a facility grouped by vehicle type and floor/zone.
     */
    @Query("""
            SELECT a FROM AllocationRule a
            WHERE a.facilityId = :facilityId
              AND LOWER(a.status) = 'active'
            ORDER BY a.vehicleTypeId, a.priorityOrder ASC
            """)
    List<AllocationRule> findAllocationMatrix(@Param("facilityId") UUID facilityId);
}
