package com.parking.pbms.repository;

import com.parking.pbms.entity.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleTypeRepository extends JpaRepository<VehicleType, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndVehicleTypeIdNot(String code, UUID vehicleTypeId);

    boolean existsByNameIgnoreCaseAndStatusIgnoreCase(String name, String status);

    boolean existsByNameIgnoreCaseAndStatusIgnoreCaseAndVehicleTypeIdNot(String name, String status, UUID vehicleTypeId);

    boolean existsByPriorityOrderAndStatusIgnoreCase(Integer priorityOrder, String status);

    boolean existsByPriorityOrderAndStatusIgnoreCaseAndVehicleTypeIdNot(Integer priorityOrder, String status, UUID vehicleTypeId);

    long countByStatusIgnoreCase(String status);

    @Query("""
            SELECT v FROM VehicleType v
            WHERE (:status IS NULL OR LOWER(v.status) = LOWER(:status))
              AND (:search IS NULL
                   OR LOWER(v.code) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<VehicleType> findWithFilters(@Param("status") String status,
                                      @Param("search") String search,
                                      Pageable pageable);

    List<VehicleType> findByStatusIgnoreCase(String status);
}
