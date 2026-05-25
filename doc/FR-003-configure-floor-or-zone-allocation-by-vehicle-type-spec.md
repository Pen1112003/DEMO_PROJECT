# FR-003 | Configure floor or zone allocation by vehicle type

**Target requirement:** FR-003 — The system shall allow the Parking Manager to configure floor or zone allocation by vehicle type.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Create allocation rules linking vehicle type(s) to allowed floor(s)/zone(s). |
| Read | View current allocation matrix and rule details by vehicle type and facility area. |
| Update | Edit allowed zones, priority, capacity constraints, and active windows. |
| Deactivate | Disable a rule without deleting history so previous sessions remain traceable. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| allocationRuleId | UUID | Yes | Primary key. |
| vehicleTypeId | UUID | Yes | FK to `vehicle_types`. |
| floorId | UUID | No | FK to floor entity; required if `zoneId` not provided. |
| zoneId | UUID | No | FK to zone entity; required if `floorId` not provided. |
| facilityId | UUID | Yes | Scope to a facility/site. |
| priorityOrder | integer | Yes | Lower value = higher match priority. |
| maxConcurrentSlots | integer | No | Optional cap for this mapping. |
| overflowZoneId | UUID | No | Fallback zone if primary target is full. |
| effectiveFrom | datetime | No | Rule activation start. |
| effectiveTo | datetime | No | Rule expiration; must be after start. |
| isDefault | boolean | Yes | Indicates default rule for a vehicle type. |
| status | enum | Yes | `active`, `inactive`. |
| notes | text | No | Operational notes. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. Each active vehicle type must have at least one active allocation rule.
2. For a vehicle type, only one active default rule (`isDefault=true`) can exist per facility.
3. A rule must target at least one of `floorId` or `zoneId`.
4. `priorityOrder` must be unique per vehicle type within the same facility for active rules.
5. `effectiveTo` (if present) must be greater than `effectiveFrom`.
6. Rule deactivation is blocked if it would leave the vehicle type with no active allocation path.
7. Entry guidance must evaluate only active, in-effect rules.
8. If primary allocation is full and `overflowZoneId` exists, route to overflow zone.
9. Changes to rules must be audit logged.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Create, read, update, deactivate allocation rules. |
| System Administrator | Full access including emergency override. |
| Parking Staff | Read-only access for entry guidance. |
| Parking User/Driver | No direct management access. |

Unauthorized write actions return `403 Forbidden`.

## 2. Front-End Specifications

### UI/UX Layout & Wireframe Concept
1. Allocation matrix view: rows by vehicle type, columns by floor/zone, showing active mappings.
2. Rule editor modal/page for create/edit with target area selection.
3. Rule timeline/status section for effective period and activation state.

### Components & Interactive Controls
- Vehicle type selector (single select).
- Floor/zone selector (multi-select with grouped options).
- Priority input and drag-and-drop reorder list.
- Date-time pickers for effective window.
- Toggle for default rule and active status.
- Confirmation dialog before deactivation.

### Client-Side Validation
- Require vehicle type + at least one area target.
- Prevent duplicate priority within same vehicle type context.
- Validate `effectiveTo > effectiveFrom`.
- Validate positive integer for `maxConcurrentSlots`.
- Disable submit while saving.

### UX States
- Loading skeleton when fetching matrix and dependencies.
- Success toast on save/deactivate.
- Inline conflict errors (priority overlap, no default rule, invalid time window).
- Disabled action buttons when user lacks permission.

## 3. Back-End Specifications

### Database Schema
**Table: `allocation_rules`**

| Column | Type | Constraints |
|---|---|---|
| rule_id | UUID | PK |
| facility_id | UUID | NOT NULL, FK -> parking_facilities.facility_id |
| vehicle_type_id | UUID | NOT NULL, FK -> vehicle_types.vehicle_type_id |
| floor_id | UUID | NULL, FK -> parking_floors.floor_id |
| zone_id | UUID | NULL, FK -> parking_zones.zone_id |
| priority_order | INT | NOT NULL |
| max_concurrent_slots | INT | NULL, CHECK (max_concurrent_slots > 0) |
| overflow_zone_id | UUID | NULL, FK -> parking_zones.zone_id |
| effective_from | TIMESTAMP | NULL |
| effective_to | TIMESTAMP | NULL |
| is_default | BOOLEAN | NOT NULL DEFAULT FALSE |
| status | VARCHAR(20) | NOT NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

Recommended constraints/indexes:
- Unique active priority per `(facility_id, vehicle_type_id, priority_order)`.
- Partial unique default rule per `(facility_id, vehicle_type_id)` where `status='active' AND is_default=true`.

### RESTful API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/allocation-rules` | Create allocation rule. |
| GET | `/api/allocation-rules` | List/filter allocation rules. |
| GET | `/api/allocation-rules/{ruleId}` | Get rule detail. |
| PUT | `/api/allocation-rules/{ruleId}` | Update rule attributes. |
| PATCH | `/api/allocation-rules/{ruleId}/status` | Activate/deactivate rule. |
| GET | `/api/allocation-matrix` | Get matrix view by vehicle type and area. |

**POST /api/allocation-rules**
- Auth: Parking Manager or System Administrator.
- Request body:
```json
{
  "facilityId": "uuid",
  "vehicleTypeId": "uuid",
  "floorId": "uuid",
  "zoneId": "uuid",
  "priorityOrder": 1,
  "maxConcurrentSlots": 100,
  "overflowZoneId": "uuid",
  "effectiveFrom": "2026-05-24T00:00:00Z",
  "effectiveTo": "2026-12-31T23:59:59Z",
  "isDefault": true,
  "status": "active",
  "notes": "Primary mapping for car"
}
```
- Success: `201 Created` with created rule payload.

**GET /api/allocation-rules**
- Query params: `facilityId`, `vehicleTypeId`, `status`, `page`, `pageSize`, `sortBy`, `sortDir`.
- Success: `200 OK` with paginated list.

**PUT /api/allocation-rules/{ruleId}**
- Auth: Parking Manager or System Administrator.
- Success: `200 OK` with updated rule payload.

**PATCH /api/allocation-rules/{ruleId}/status**
- Request body:
```json
{ "status": "inactive" }
```
- Success: `200 OK` with updated status.

### Exception Handling & HTTP Status Codes
- `400 Bad Request` for invalid payload/time window/missing target area.
- `401 Unauthorized` for missing/invalid token.
- `403 Forbidden` for insufficient role.
- `404 Not Found` for unknown rule/vehicle type/area reference.
- `409 Conflict` for duplicate priority/default conflicts or invalid deactivation that breaks required allocation coverage.

### Error Response Body
```json
{
  "error": {
    "code": "ALLOCATION_PRIORITY_CONFLICT",
    "message": "Priority order already exists for this vehicle type in the selected facility.",
    "details": []
  }
}
```

## 4. Acceptance Criteria

### Happy Path
1. **Given** the Parking Manager has permission and active vehicle types exist, **when** they create a valid floor/zone allocation rule, **then** the system stores the rule and shows it in the allocation matrix.
2. **Given** multiple active rules exist for a vehicle type, **when** the Parking Manager updates the priority order, **then** the system persists the new order and uses it for subsequent routing.

### Edge Cases / Error Handling
3. **Given** a rule with the same priority already exists for the same vehicle type in the facility, **when** the Parking Manager saves a new rule with that priority, **then** the system rejects the request with `409 Conflict`.
4. **Given** deactivating a rule would leave the vehicle type without any active allocation path, **when** the Parking Manager attempts to deactivate it, **then** the system blocks the action and returns a validation conflict message.
