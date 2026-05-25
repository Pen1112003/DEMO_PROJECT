package com.parking.pbms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.pbms.entity.AllocationRule;
import com.parking.pbms.exception.ConflictException;
import com.parking.pbms.repository.AllocationRuleRepository;
import com.parking.pbms.repository.VehicleTypeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = {AllocationRuleController.class, AllocationMatrixController.class}, properties = "server.servlet.context-path=")
@Import(com.parking.pbms.exception.GlobalExceptionHandler.class)
class AllocationRuleControllerTest {
    private static final UUID DEFAULT_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");
    private static final UUID FACILITY_ID = UUID.randomUUID();
    private static final UUID VEHICLE_TYPE_ID = UUID.randomUUID();
    private static final UUID FLOOR_ID = UUID.randomUUID();
    private static final UUID ZONE_ID = UUID.randomUUID();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AllocationRuleRepository allocationRuleRepository;

    @MockBean
    private VehicleTypeRepository vehicleTypeRepository;

    @Test
    void createAllocationRuleSuccessfullyWhenAllInputsValid() throws Exception {
        UUID ruleId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        AllocationRule request = AllocationRule.builder()
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .maxConcurrentSlots(100)
                .isDefault(true)
                .status("active")
                .notes("Primary mapping for car")
                .createdBy(DEFAULT_USER_ID)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        AllocationRule response = AllocationRule.builder()
                .ruleId(ruleId)
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .maxConcurrentSlots(100)
                .isDefault(true)
                .status("active")
                .notes("Primary mapping for car")
                .createdAt(now)
                .createdBy(DEFAULT_USER_ID)
                .updatedAt(now)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(vehicleTypeRepository.existsById(VEHICLE_TYPE_ID)).thenReturn(true);
        when(allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, 1, "active"))
                .thenReturn(false);
        when(allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, "active"))
                .thenReturn(false);
        when(allocationRuleRepository.save(any(AllocationRule.class))).thenReturn(response);

        mockMvc.perform(post("/allocation-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.ruleId", notNullValue()))
                .andExpect(jsonPath("$.facilityId", is(FACILITY_ID.toString())))
                .andExpect(jsonPath("$.vehicleTypeId", is(VEHICLE_TYPE_ID.toString())))
                .andExpect(jsonPath("$.priorityOrder", is(1)))
                .andExpect(jsonPath("$.isDefault", is(true)))
                .andExpect(jsonPath("$.status", is("active")));
    }

    @Test
    void createAllocationRuleFailsWhenNeitherFloorNorZoneProvided() throws Exception {
        AllocationRule request = AllocationRule.builder()
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .priorityOrder(1)
                .isDefault(true)
                .status("active")
                .createdBy(DEFAULT_USER_ID)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(vehicleTypeRepository.existsById(VEHICLE_TYPE_ID)).thenReturn(true);

        mockMvc.perform(post("/allocation-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.error.message", containsString("At least one of floorId or zoneId")));
    }

    @Test
    void createAllocationRuleFailsWhenPriorityConflicts() throws Exception {
        AllocationRule request = AllocationRule.builder()
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .isDefault(true)
                .status("active")
                .createdBy(DEFAULT_USER_ID)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(vehicleTypeRepository.existsById(VEHICLE_TYPE_ID)).thenReturn(true);
        when(allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, 1, "active"))
                .thenReturn(true);

        mockMvc.perform(post("/allocation-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("ALLOCATION_PRIORITY_CONFLICT")))
                .andExpect(jsonPath("$.error.message", containsString("Priority order already exists")));
    }

    @Test
    void createAllocationRuleFailsWhenDefaultRuleAlreadyExists() throws Exception {
        AllocationRule request = AllocationRule.builder()
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .isDefault(true)
                .status("active")
                .createdBy(DEFAULT_USER_ID)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(vehicleTypeRepository.existsById(VEHICLE_TYPE_ID)).thenReturn(true);
        when(allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, 1, "active"))
                .thenReturn(false);
        when(allocationRuleRepository.existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, "active"))
                .thenReturn(true);

        mockMvc.perform(post("/allocation-rules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("ALLOCATION_DEFAULT_CONFLICT")))
                .andExpect(jsonPath("$.error.message", containsString("default allocation rule already exists")));
    }

    @Test
    void getDetailReturnsAllocationRule() throws Exception {
        UUID ruleId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        AllocationRule rule = AllocationRule.builder()
                .ruleId(ruleId)
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .isDefault(true)
                .status("active")
                .createdAt(now)
                .createdBy(DEFAULT_USER_ID)
                .updatedAt(now)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        when(allocationRuleRepository.findById(ruleId)).thenReturn(Optional.of(rule));

        mockMvc.perform(get("/allocation-rules/" + ruleId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleId", is(ruleId.toString())))
                .andExpect(jsonPath("$.facilityId", is(FACILITY_ID.toString())))
                .andExpect(jsonPath("$.priorityOrder", is(1)));
    }

    @Test
    void getDetailReturnsNotFoundWhenRuleDoesNotExist() throws Exception {
        UUID ruleId = UUID.randomUUID();
        when(allocationRuleRepository.findById(ruleId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/allocation-rules/" + ruleId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatusFailsWhenDeactivationWouldLeaveNoActiveRules() throws Exception {
        UUID ruleId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        AllocationRule existing = AllocationRule.builder()
                .ruleId(ruleId)
                .facilityId(FACILITY_ID)
                .vehicleTypeId(VEHICLE_TYPE_ID)
                .floorId(FLOOR_ID)
                .priorityOrder(1)
                .status("active")
                .createdAt(now)
                .createdBy(DEFAULT_USER_ID)
                .updatedAt(now)
                .updatedBy(DEFAULT_USER_ID)
                .build();

        AllocationRuleController.StatusPatchRequest statusRequest = 
                new AllocationRuleController.StatusPatchRequest("inactive", DEFAULT_USER_ID);

        when(allocationRuleRepository.findById(ruleId)).thenReturn(Optional.of(existing));
        when(allocationRuleRepository.countByFacilityIdAndVehicleTypeIdAndStatus(
                FACILITY_ID, VEHICLE_TYPE_ID, "active"))
                .thenReturn(1L);

        mockMvc.perform(patch("/allocation-rules/" + ruleId + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code", is("ALLOCATION_DEACTIVATION_BLOCKED")))
                .andExpect(jsonPath("$.error.message", containsString("Deactivation is blocked")));
    }
}
