package com.parking.pbms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vehicle_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vehicle_type_id", updatable = false, nullable = false)
    private UUID vehicleTypeId;

    @NotBlank(message = "Code is required")
    @Size(max = 30, message = "Code must not exceed 30 characters")
    @Column(name = "code", nullable = false, unique = true, length = 30)
    private String code;

    @NotBlank(message = "Name is required")
    @Size(max = 80, message = "Name must not exceed 80 characters")
    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Positive(message = "Wheel count must be a positive integer")
    @Column(name = "wheel_count")
    private Integer wheelCount;

    @Positive(message = "Max height must be a positive integer")
    @Column(name = "max_height_cm")
    private Integer maxHeightCm;

    @Positive(message = "Max width must be a positive integer")
    @Column(name = "max_width_cm")
    private Integer maxWidthCm;

    @Positive(message = "Max length must be a positive integer")
    @Column(name = "max_length_cm")
    private Integer maxLengthCm;

    @Column(name = "default_allocation_rule_id")
    private UUID defaultAllocationRuleId;

    @Column(name = "default_pricing_policy_id")
    private UUID defaultPricingPolicyId;

    @Column(name = "requires_manual_approval", nullable = false)
    @Builder.Default
    private Boolean requiresManualApproval = false;

    @PositiveOrZero(message = "Priority order must be non-negative")
    @Column(name = "priority_order")
    private Integer priorityOrder;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "active";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "updated_by", nullable = false)
    private UUID updatedBy;
}
