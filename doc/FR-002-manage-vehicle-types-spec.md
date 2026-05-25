# FR-002 | Manage vehicle types

**Target requirement:** FR-002 — The system shall allow the Parking Manager to manage vehicle types.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Create a vehicle type with classification, dimensions, and operational constraints. |
| Read | View vehicle type list and details used by allocation, pricing, and entry workflows. |
| Update | Edit mutable attributes (name, status, dimensions, policy flags) of a vehicle type. |
| Deactivate | Soft-delete/deactivate a vehicle type so it is no longer selectable for new sessions. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| vehicleTypeId | UUID | Yes | Primary key. |
| code | string | Yes | Unique business code (e.g., `MOTORBIKE`, `CAR`, `TRUCK`). |
| name | string | Yes | Display name for operators and users. |
| description | string | No | Optional business description. |
| wheelCount | integer | No | Informational classification field. |
| maxHeightCm | integer | No | Height limit for compatibility checks. |
| maxWidthCm | integer | No | Width limit for compatibility checks. |
| maxLengthCm | integer | No | Length limit for compatibility checks. |
| defaultAllocationRuleId | UUID | No | Optional default zone/floor rule reference. |
| defaultPricingPolicyId | UUID | No | Optional default pricing policy reference. |
| requiresManualApproval | boolean | Yes | Whether staff must manually approve entry. |
| priorityOrder | integer | No | UI ordering and fallback matching precedence. |
| status | enum | Yes | `active`, `inactive`. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. `code` must be uppercase, alphanumeric with underscore, and unique.
2. `name` is required and must be unique among active vehicle types.
3. At least one active vehicle type must always exist in the system.
4. A vehicle type cannot be deactivated if there are active sessions using it.
5. Dimension values, if provided, must be positive integers.
6. `priorityOrder`, if provided, must be non-negative and unique per active type.
7. Entry validation and allocation flows must use only `active` vehicle types.
8. Changes must be audit logged with user and timestamp.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Create, read, update, deactivate vehicle types. |
| System Administrator | Full access including force deactivation override. |
| Parking Staff | Read-only access for entry and guidance workflows. |
| Parking User/Driver | Read-only public access to supported active vehicle types. |

Unauthorized management actions return `403 Forbidden`.

## 2. Front-End Specifications

### Screens / Views
1. Vehicle type management list page (filterable table, status badges, quick actions).
2. Create/Edit vehicle type form (modal or dedicated page).
3. Read-only supported vehicle type panel for public-facing screens.

### Components & Interactive Controls
- Search by code/name.
- Status filter (`active`, `inactive`).
- Sort by priority, name, and updated time.
- Form controls for code, name, dimensions, policy links, and status.
- Confirm dialog for deactivation.
- Pagination for large datasets.

### Client-Side Validation
- Required checks for `code`, `name`, and `status`.
- `code` format regex: `^[A-Z0-9_]{2,30}$`.
- Numeric validation for dimensions and priority (integer, non-negative).
- Prevent submit while request is in-flight.

### UX States
- Loading skeleton for list and form bootstrap.
- Inline field errors + top-level toast for request failures.
- Success toast on create/update/deactivate.
- Disabled deactivation action when backend signals dependency conflicts.

## 3. Back-End Specifications

### Database Schema
**Table: `vehicle_types`**

| Column | Type | Constraints |
|---|---|---|
| vehicle_type_id | UUID | PK |
| code | VARCHAR(30) | NOT NULL, UNIQUE |
| name | VARCHAR(80) | NOT NULL |
| description | TEXT | NULL |
| wheel_count | INT | NULL, CHECK (wheel_count > 0) |
| max_height_cm | INT | NULL, CHECK (max_height_cm > 0) |
| max_width_cm | INT | NULL, CHECK (max_width_cm > 0) |
| max_length_cm | INT | NULL, CHECK (max_length_cm > 0) |
| default_allocation_rule_id | UUID | NULL, FK -> allocation_rules.rule_id |
| default_pricing_policy_id | UUID | NULL, FK -> pricing_policies.policy_id |
| requires_manual_approval | BOOLEAN | NOT NULL DEFAULT FALSE |
| priority_order | INT | NULL |
| status | VARCHAR(20) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

Recommended index: `(status, priority_order, name)`.

### REST API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/vehicle-types` | Create a vehicle type. |
| GET | `/api/vehicle-types` | List vehicle types with filter/sort/pagination. |
| GET | `/api/vehicle-types/{vehicleTypeId}` | Get detail of one vehicle type. |
| PUT | `/api/vehicle-types/{vehicleTypeId}` | Update a vehicle type. |
| PATCH | `/api/vehicle-types/{vehicleTypeId}/status` | Activate/deactivate a vehicle type. |
| GET | `/api/public/vehicle-types` | Public list of supported active vehicle types. |

**POST /api/vehicle-types**
- Auth: Parking Manager or System Administrator.
- Request body:
```json
{
  "code": "MOTORBIKE",
  "name": "Motorbike",
  "description": "Two-wheel vehicle",
  "wheelCount": 2,
  "maxHeightCm": 200,
  "maxWidthCm": 90,
  "maxLengthCm": 240,
  "defaultAllocationRuleId": "uuid",
  "defaultPricingPolicyId": "uuid",
  "requiresManualApproval": false,
  "priorityOrder": 1,
  "status": "active"
}
```
- Success: `201 Created` with persisted entity.

**GET /api/vehicle-types**
- Query params: `status`, `search`, `sortBy`, `sortDir`, `page`, `pageSize`.
- Success: `200 OK` with paginated list payload.

**PUT /api/vehicle-types/{vehicleTypeId}**
- Auth: Parking Manager or System Administrator.
- Request body: editable fields except immutable ID.
- Success: `200 OK` with updated entity.

**PATCH /api/vehicle-types/{vehicleTypeId}/status**
- Request body:
```json
{ "status": "inactive" }
```
- Success: `200 OK` with updated status.

### Exception Handling & Status Codes
- `400 Bad Request` for payload/format/constraint violations.
- `401 Unauthorized` for missing/invalid auth.
- `403 Forbidden` for role mismatch.
- `404 Not Found` for unknown vehicle type ID.
- `409 Conflict` for duplicate code/name or invalid deactivation due to active dependencies.

### Error Response Shape
```json
{
  "error": {
    "code": "VEHICLE_TYPE_IN_USE",
    "message": "Vehicle type cannot be deactivated while active sessions exist.",
    "details": []
  }
}
```

## 4. Acceptance Criteria

### Happy Path
1. **Given** the Parking Manager has permission, **when** they create a vehicle type with valid required fields, **then** the system stores it and shows it in the management list.
2. **Given** an active vehicle type exists, **when** the Parking Manager updates its dimensions and saves, **then** the system persists the changes and applies them to subsequent validation workflows.

### Edge Cases / Error Handling
3. **Given** a vehicle type code already exists, **when** the Parking Manager submits a new type with the same code, **then** the system rejects the request with `409 Conflict`.
4. **Given** a vehicle type is used by active parking sessions, **when** the Parking Manager attempts to deactivate it, **then** the system rejects the action and returns a dependency conflict message.
