package com.parking.pbms.repository;

import com.parking.pbms.entity.ParkingFacility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParkingFacilityRepository extends JpaRepository<ParkingFacility, UUID> {
    Optional<ParkingFacility> findByFacilityCode(String facilityCode);
    boolean existsByFacilityCode(String facilityCode);
}
