# FR-004 | Manage parking slot statuses

**Target requirement:** FR-004 — The system shall allow the Parking Manager to manage parking slot statuses.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Initialize parking slots with default status and metadata. |
| Read | View slot status by floor/zone/vehicle type in real time. |
| Update | Change slot status manually or via operational events. |
| Deactivate | Disable a slot from operations for maintenance/closure. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| slotId | UUID | Yes | Primary key. |
| slotCode | string | Yes | Unique slot identifier in facility. |
| facilityId | UUID | Yes | Facility scope. |
| floorId | UUID | Yes | Floor reference. |
| zoneId | UUID | Yes | Zone reference. |
| supportedVehicleTypeId | UUID | No | Optional vehicle type restriction. |
| status | enum | Yes | `free`, `occupied`, `reserved`, `maintenance`, `locked`. |
| occupancySource | enum | No | `manual`, `entry-event`, `exit-event`, `system`. |
| isActive | boolean | Yes | Whether slot is operationally active. |
| statusUpdatedAt | datetime | Yes | Last status update time. |
| statusUpdatedBy | UUID | No | User/system actor for latest update. |
| notes | text | No | Optional status/change note. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. `slotCode` must be unique within a facility.
2. Status transitions must follow allowed paths:
   - `free -> occupied|reserved|maintenance|locked`
   - `occupied -> free|maintenance|locked`
   - `reserved -> occupied|free|maintenance`
   - `maintenance -> free|locked`
   - `locked -> free|maintenance`
3. A slot cannot be set to `free` if an active parking session is still linked to it.
4. `maintenance` and `locked` slots are excluded from assignment/entry guidance.
5. Manual override actions must store reason in `notes`.
6. All status changes must be history logged for traceability.
7. Deactivating a slot (`isActive=false`) requires status `maintenance` or `locked`.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Full management of slot statuses and slot activation. |
| Parking Staff | Update operational statuses (`occupied`/`free`) based on gate flow and exception handling. |
| System Administrator | Full override rights. |
| Parking User/Driver | Read-only availability view (aggregated, public-safe data). |

Unauthorized write actions return `403 Forbidden`.

## 2. Front-End Specifications (FE)

### UI/UX Layout & Wireframe Concept
1. Slot monitoring dashboard (grid/map by floor/zone with color-coded statuses).
2. Slot list table view with filters and bulk update actions.
3. Slot status update modal with transition guardrails and reason input.

### Components & Interactive Controls
- Floor and zone filters.
- Status chips with count summary.
- Search by slot code.
- Bulk selection + bulk status update action.
- Confirm dialog for destructive/impactful updates (`maintenance`, `locked`, deactivate).
- Auto-refresh toggle for live status.

### Client-Side Validation
- Only allowed status transitions selectable based on current status.
- Require reason text for manual override and maintenance/lock actions.
- Block submit if active session conflict flag is returned by pre-check.
- Disable action buttons during pending requests.

### UX States
- Loading skeleton for map/table data.
- Success toast on update.
- Conflict error banner for invalid transitions.
- Inline indicators for stale data and refresh prompt.

## 3. Back-End Specifications (BE)

### Database Schema Design
**Table: `parking_slots`**

| Column | Type | Constraints |
|---|---|---|
| slot_id | UUID | PK |
| slot_code | VARCHAR(40) | NOT NULL |
| facility_id | UUID | NOT NULL, FK -> parking_facilities.facility_id |
| floor_id | UUID | NOT NULL, FK -> parking_floors.floor_id |
| zone_id | UUID | NOT NULL, FK -> parking_zones.zone_id |
| supported_vehicle_type_id | UUID | NULL, FK -> vehicle_types.vehicle_type_id |
| status | VARCHAR(20) | NOT NULL |
| occupancy_source | VARCHAR(20) | NULL |
| is_active | BOOLEAN | NOT NULL DEFAULT TRUE |
| status_updated_at | TIMESTAMP | NOT NULL |
| status_updated_by | UUID | NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

Unique constraint: `(facility_id, slot_code)`.

**Table: `slot_status_history`**

| Column | Type | Constraints |
|---|---|---|
| history_id | UUID | PK |
| slot_id | UUID | NOT NULL, FK -> parking_slots.slot_id |
| from_status | VARCHAR(20) | NOT NULL |
| to_status | VARCHAR(20) | NOT NULL |
| changed_at | TIMESTAMP | NOT NULL |
| changed_by | UUID | NULL |
| source | VARCHAR(20) | NOT NULL |
| reason | TEXT | NULL |

### RESTful API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/slots` | List slots with filters. |
| GET | `/api/slots/{slotId}` | Get slot details. |
| PATCH | `/api/slots/{slotId}/status` | Update single slot status. |
| PATCH | `/api/slots/status/bulk` | Bulk update statuses. |
| GET | `/api/slots/availability/summary` | Aggregated counts by status/zone/type. |
| GET | `/api/public/slots/availability` | Public availability view for drivers. |

**PATCH /api/slots/{slotId}/status**
- Auth: Parking Manager, Parking Staff (restricted), System Administrator.
- Request body:
```json
{
  "status": "maintenance",
  "source": "manual",
  "reason": "CCTV maintenance in zone B2"
}
```
- Success: `200 OK` with updated slot payload.

**PATCH /api/slots/status/bulk**
- Request body:
```json
{
  "slotIds": ["uuid1", "uuid2"],
  "status": "locked",
  "source": "manual",
  "reason": "Emergency closure"
}
```
- Success: `200 OK` with updated count and failed item details if partial.

### Exception Handling & HTTP Status Codes
- `400 Bad Request` for invalid status value or malformed payload.
- `401 Unauthorized` for missing/invalid authentication.
- `403 Forbidden` for role mismatch.
- `404 Not Found` for unknown slot ID.
- `409 Conflict` for invalid transition or active session conflicts.

### Error Response Body
```json
{
  "error": {
    "code": "INVALID_SLOT_STATUS_TRANSITION",
    "message": "Cannot change slot from occupied to reserved directly.",
    "details": []
  }
}
```

## 4. Acceptance Criteria (Given - When - Then)

### Happy Path
1. **Given** the Parking Manager opens slot management, **when** they set a `free` slot to `maintenance` with a reason, **then** the system updates the slot status and records history.
2. **Given** active slot data exists, **when** Parking Staff update a slot from `occupied` to `free` after a valid exit event, **then** the system persists the new status and reflects updated availability.

### Edge Case / Error Handling
3. **Given** a slot is `occupied` with an active session, **when** a user attempts an invalid transition to `reserved`, **then** the system rejects the update with `409 Conflict`.
4. **Given** a user without slot-management permission attempts to update slot status, **when** they submit the request, **then** the system returns `403 Forbidden` and keeps the slot unchanged.
