package com.parking.pbms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "parking_facilities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParkingFacility {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "facility_id", updatable = false, nullable = false)
    private UUID facilityId;

    @NotBlank(message = "Facility code is required")
    @Size(max = 50, message = "Facility code must not exceed 50 characters")
    @Column(name = "facility_code", unique = true, nullable = false, length = 50)
    private String facilityCode;

    @NotBlank(message = "Facility name is required")
    @Size(max = 120, message = "Facility name must not exceed 120 characters")
    @Column(name = "facility_name", nullable = false, length = 120)
    private String facilityName;

    @Size(max = 120, message = "Building name must not exceed 120 characters")
    @Column(name = "building_name", length = 120)
    private String buildingName;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    @Column(name = "address_line1", nullable = false, length = 255)
    private String addressLine1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Size(max = 100, message = "State or region must not exceed 100 characters")
    @Column(name = "state_or_region", length = 100)
    private String stateOrRegion;

    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @NotBlank(message = "Timezone is required")
    @Size(max = 64, message = "Timezone must not exceed 64 characters")
    @Column(name = "timezone", nullable = false, length = 64)
    private String timezone;

    @Size(max = 30, message = "Contact phone must not exceed 30 characters")
    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Email(message = "Contact email must be a valid email address")
    @Size(max = 255, message = "Contact email must not exceed 255 characters")
    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "total_floors")
    private Integer totalFloors;

    @Column(name = "total_zones")
    private Integer totalZones;

    @NotBlank(message = "Status is required")
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "draft"; // draft, active, inactive, archived

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

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
