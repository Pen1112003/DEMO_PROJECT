package com.parking.pbms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.pbms.entity.VehicleType;
import com.parking.pbms.repository.ParkingSessionRepository;
import com.parking.pbms.repository.VehicleTypeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = VehicleTypeController.class, properties = "server.servlet.context-path=")
@Import(com.parking.pbms.exception.GlobalExceptionHandler.class)
class VehicleTypeControllerTest {
    private static final UUID DEFAULT_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private VehicleTypeRepository vehicleTypeRepository;

    @MockBean
    private ParkingSessionRepository parkingSessionRepository;

    @Test
    void createVehicleTypeReturnsConflictWhenCodeExists() throws Exception {
        VehicleType request = VehicleType.builder()
                .code("CAR")
                .name("Car")
                .status("active")
                .requiresManualApproval(false)
                .build();

        when(vehicleTypeRepository.existsByCodeIgnoreCase("CAR")).thenReturn(true);

        mockMvc.perform(post("/vehicle-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("CONFLICT"));
    }

    @Test
    void createVehicleTypeReturnsCreatedOnHappyPath() throws Exception {
        UUID id = UUID.randomUUID();
        VehicleType saved = VehicleType.builder()
                .vehicleTypeId(id)
                .code("MOTORBIKE")
                .name("Motorbike")
                .status("active")
                .requiresManualApproval(false)
                .createdBy(DEFAULT_USER_ID)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(vehicleTypeRepository.existsByCodeIgnoreCase("MOTORBIKE")).thenReturn(false);
        when(vehicleTypeRepository.existsByNameIgnoreCaseAndStatusIgnoreCase("Motorbike", "active")).thenReturn(false);
        when(vehicleTypeRepository.save(any(VehicleType.class))).thenReturn(saved);

        mockMvc.perform(post("/vehicle-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "code": "MOTORBIKE",
                                  "name": "Motorbike",
                                  "requiresManualApproval": false,
                                  "status": "active"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.vehicleTypeId").value(id.toString()))
                .andExpect(jsonPath("$.code").value("MOTORBIKE"));
    }

    @Test
    void deactivateVehicleTypeReturnsConflictWhenActiveSessionsExist() throws Exception {
        UUID id = UUID.randomUUID();
        VehicleType current = VehicleType.builder()
                .vehicleTypeId(id)
                .code("CAR")
                .name("Car")
                .status("active")
                .requiresManualApproval(false)
                .build();

        when(vehicleTypeRepository.findById(id)).thenReturn(Optional.of(current));
        when(parkingSessionRepository.existsByVehicleTypeIdAndStatusIgnoreCase(id, "active")).thenReturn(true);

        mockMvc.perform(patch("/vehicle-types/{vehicleTypeId}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "status": "inactive" }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.message").value("Vehicle type cannot be deactivated while active sessions exist."));
    }

    @Test
    void deactivateVehicleTypeReturnsConflictWhenItIsLastActiveType() throws Exception {
        UUID id = UUID.randomUUID();
        VehicleType current = VehicleType.builder()
                .vehicleTypeId(id)
                .code("CAR")
                .name("Car")
                .status("active")
                .requiresManualApproval(false)
                .build();

        when(vehicleTypeRepository.findById(id)).thenReturn(Optional.of(current));
        when(parkingSessionRepository.existsByVehicleTypeIdAndStatusIgnoreCase(id, "active")).thenReturn(false);
        when(vehicleTypeRepository.countByStatusIgnoreCase("active")).thenReturn(1L);

        mockMvc.perform(patch("/vehicle-types/{vehicleTypeId}/status", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "status": "inactive" }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.message").value("At least one active vehicle type must always exist."));
    }
}
