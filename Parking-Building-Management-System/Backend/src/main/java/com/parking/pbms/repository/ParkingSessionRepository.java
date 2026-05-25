package com.parking.pbms.repository;

import com.parking.pbms.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, UUID> {
    boolean existsByVehicleTypeIdAndStatusIgnoreCase(UUID vehicleTypeId, String status);
}
