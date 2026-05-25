# FR-005 | Configure pricing and fee policies

**Target requirement:** FR-005 — The system shall allow the Parking Manager to configure pricing and fee policies.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Create pricing policies for vehicle types, time windows, and fee rules. |
| Read | View active/inactive policies and fee calculation components. |
| Update | Modify rates, grace periods, overtime rules, and policy applicability. |
| Deactivate | Disable policies while preserving history and references. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| pricingPolicyId | UUID | Yes | Primary key. |
| policyCode | string | Yes | Unique policy identifier. |
| policyName | string | Yes | Human-readable policy name. |
| vehicleTypeId | UUID | Yes | FK to `vehicle_types`. |
| facilityId | UUID | Yes | Policy scope. |
| billingUnit | enum | Yes | `hourly`, `block`, `daily`, `flat`. |
| baseRate | decimal | Yes | Initial charge amount. |
| incrementalRate | decimal | No | Per unit increment rate. |
| incrementMinutes | integer | No | Billing increment in minutes. |
| gracePeriodMinutes | integer | No | Free period before charging. |
| maxDailyCap | decimal | No | Optional charge cap per day. |
| overtimeThresholdMinutes | integer | No | Threshold for overtime penalty. |
| overtimePenaltyRate | decimal | No | Extra fee when overtime applies. |
| lostTicketFlatFee | decimal | No | Fee for lost ticket handling. |
| effectiveFrom | datetime | Yes | Policy effective start. |
| effectiveTo | datetime | No | Optional end date/time. |
| status | enum | Yes | `draft`, `active`, `inactive`, `archived`. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. `policyCode` must be unique per facility.
2. Active policy windows for the same vehicle type must not overlap.
3. `effectiveTo`, if provided, must be greater than `effectiveFrom`.
4. Monetary values must be non-negative.
5. `incrementMinutes` must be positive when `incrementalRate` is set.
6. Exactly one active default policy must exist per vehicle type and facility.
7. A policy used by unpaid sessions cannot be archived.
8. Fee calculations must be deterministic and auditable with versioned policy snapshots.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Create, read, update, activate/deactivate pricing policies. |
| System Administrator | Full access and override. |
| Parking Staff | Read-only policy lookup and fee preview. |
| Parking User/Driver | Read-only public pricing/rule view. |

Unauthorized write actions return `403 Forbidden`.

## 2. Front-End Specifications (FE)

### UI/UX Layout & Wireframe Concept
1. Pricing policy list with status, effective window, and vehicle type.
2. Policy editor form with sections: Base fee, increments, caps, exceptions.
3. Fee simulation panel to test calculation with sample duration.

### Components & Interactive Controls
- Vehicle type selector.
- Currency and numeric inputs with min constraints.
- Date-time range picker for effective window.
- Toggle for activating/deactivating policy.
- Conflict warning banner for overlapping policies.

### Client-Side Validation
- Required fields for `policyCode`, `policyName`, `vehicleTypeId`, `billingUnit`, `baseRate`, `effectiveFrom`.
- Non-negative checks for all fee fields.
- `effectiveTo > effectiveFrom`.
- Prevent submit during in-flight request.

### UX States
- Loading skeleton for policy list/form.
- Inline errors for invalid fields.
- Success toast on save/status change.
- Conflict modal for activation overlap errors.

## 3. Back-End Specifications (BE)

### Database Schema Design
**Table: `pricing_policies`**

| Column | Type | Constraints |
|---|---|---|
| policy_id | UUID | PK |
| facility_id | UUID | NOT NULL, FK -> parking_facilities.facility_id |
| vehicle_type_id | UUID | NOT NULL, FK -> vehicle_types.vehicle_type_id |
| policy_code | VARCHAR(40) | NOT NULL |
| policy_name | VARCHAR(120) | NOT NULL |
| billing_unit | VARCHAR(20) | NOT NULL |
| base_rate | DECIMAL(12,2) | NOT NULL CHECK (base_rate >= 0) |
| incremental_rate | DECIMAL(12,2) | NULL CHECK (incremental_rate >= 0) |
| increment_minutes | INT | NULL CHECK (increment_minutes > 0) |
| grace_period_minutes | INT | NULL CHECK (grace_period_minutes >= 0) |
| max_daily_cap | DECIMAL(12,2) | NULL CHECK (max_daily_cap >= 0) |
| overtime_threshold_minutes | INT | NULL CHECK (overtime_threshold_minutes >= 0) |
| overtime_penalty_rate | DECIMAL(12,2) | NULL CHECK (overtime_penalty_rate >= 0) |
| lost_ticket_flat_fee | DECIMAL(12,2) | NULL CHECK (lost_ticket_flat_fee >= 0) |
| effective_from | TIMESTAMP | NOT NULL |
| effective_to | TIMESTAMP | NULL |
| status | VARCHAR(20) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

Unique constraint: `(facility_id, policy_code)`.

### RESTful API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/pricing-policies` | Create policy. |
| GET | `/api/pricing-policies` | List/filter policies. |
| GET | `/api/pricing-policies/{policyId}` | Get policy detail. |
| PUT | `/api/pricing-policies/{policyId}` | Update policy. |
| PATCH | `/api/pricing-policies/{policyId}/status` | Change status (activate/deactivate/archive). |
| POST | `/api/pricing-policies/simulate` | Simulate fee calculation. |
| GET | `/api/public/pricing` | Public pricing/rules view. |

**POST /api/pricing-policies**
- Auth: Parking Manager or System Administrator.
- Request body:
```json
{
  "facilityId": "uuid",
  "vehicleTypeId": "uuid",
  "policyCode": "CAR_STD_HOURLY",
  "policyName": "Car Standard Hourly",
  "billingUnit": "hourly",
  "baseRate": 10000,
  "incrementalRate": 5000,
  "incrementMinutes": 60,
  "gracePeriodMinutes": 10,
  "maxDailyCap": 120000,
  "effectiveFrom": "2026-05-24T00:00:00Z",
  "status": "active"
}
```
- Success: `201 Created` with created policy payload.

### Exception Handling & HTTP Status Codes
- `400 Bad Request` for invalid payload and validation errors.
- `401 Unauthorized` for missing/invalid auth.
- `403 Forbidden` for role mismatch.
- `404 Not Found` for unknown referenced entities.
- `409 Conflict` for policy-code duplication or time-window overlap.

### Error Response Body
```json
{
  "error": {
    "code": "PRICING_POLICY_OVERLAP",
    "message": "Active policy time range overlaps with an existing policy for this vehicle type.",
    "details": []
  }
}
```

## 4. Acceptance Criteria (Given - When - Then)

### Happy Path
1. **Given** the Parking Manager has permission, **when** they create a valid pricing policy and activate it, **then** the system stores the policy and applies it to new fee calculations.
2. **Given** an active policy exists, **when** the Parking Manager updates rate values with valid data, **then** the system saves the changes and reflects them in fee simulation.

### Edge Case / Error Handling
3. **Given** an active policy already covers a vehicle type time window, **when** the Parking Manager activates another overlapping policy, **then** the system rejects the request with `409 Conflict`.
4. **Given** a user without pricing-management permission submits a create/update request, **when** the API receives it, **then** the system returns `403 Forbidden` and does not persist changes.
