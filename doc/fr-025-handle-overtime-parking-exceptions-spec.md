# FR-025 | handle overtime parking exceptions.

**Target requirement:** FR-025 — The system shall allow Parking Staff to handle overtime parking exceptions.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Create required records/configuration needed to support this functional requirement. |
| Read | Read and monitor data related to this requirement with filter and detail views. |
| Update | Update rule/state/metadata while preserving auditability and consistency. |
| Deactivate | Deactivate/archive configuration or operational state without hard-deleting history. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| recordId | UUID | Yes | Primary key for this functional dataset. |
| facilityId | UUID | Yes | Facility/site scope. |
| vehicleTypeId | UUID | No | Vehicle type scope when applicable. |
| status | enum | Yes | Operational state for this feature flow. |
| effectiveFrom | datetime | No | Start time for effective rule or processing window. |
| effectiveTo | datetime | No | End time for effective rule or processing window. |
| notes | text | No | Operator note for exceptions or manual actions. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. All operations must be scoped to an active facility and authorized role.
2. Time-based values must follow facility timezone and valid range logic.
3. Referential entities (vehicle type/session/slot/user) must exist and be active.
4. Invalid state transitions or overlapping effective windows are rejected.
5. All write operations must produce auditable history records.

### RBAC
| Role | Permissions |
|---|---|
| Parking Staff | Primary role to execute this functional requirement. |
| System Administrator | Full override and cross-facility access. |
| Parking Staff | Operational access where workflow requires staff action. |
| Parking User/Driver | Read-only access only for public-facing flows. |

Unauthorized actions return `403 Forbidden`.

## 2. Front-End Specifications (FE)

### UI/UX Layout & Wireframe Concept
1. Primary feature screen for FR-025 with list/detail/workflow panel.
2. Filter/search controls for facility, vehicle type, status, and date range.
3. Action form/modal for creation, update, and exception handling.

### Components & Interactive Controls
- Search/filter bar with date range and status filters.
- Data table/cards with sorting and pagination.
- Action buttons for create/update/status transitions.
- Confirmation dialog for high-impact actions.

### Client-Side Validation
- Required-field and enum validation before submit.
- Date range validation where applicable.
- Prevent duplicate or conflicting operations.
- Disable submit while request is in-flight.

### UX States
- Loading skeleton while fetching data.
- Empty state for no matching records.
- Success toast after save/update actions.
- Error banner/toast for API validation or permission errors.

## 3. Back-End Specifications (BE)

### Database Schema Design
**Table: `fr-025_records`**

| Column | Type | Constraints |
|---|---|---|
| record_id | UUID | PK |
| facility_id | UUID | NOT NULL |
| vehicle_type_id | UUID | NULL |
| status | VARCHAR(20) | NOT NULL |
| effective_from | TIMESTAMP | NULL |
| effective_to | TIMESTAMP | NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

### RESTful API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/fr-025/records` | Create new record/configuration/workflow entry. |
| GET | `/api/fr-025/records` | List records with filters and pagination. |
| GET | `/api/fr-025/records/{recordId}` | Get record detail. |
| PUT | `/api/fr-025/records/{recordId}` | Update record fields. |
| PATCH | `/api/fr-025/records/{recordId}/status` | Change status/transition state. |

### Exception Handling & HTTP Status Codes
- `400 Bad Request` for validation failures.
- `401 Unauthorized` for missing or invalid authentication.
- `403 Forbidden` for insufficient permissions.
- `404 Not Found` for missing referenced entities.
- `409 Conflict` for duplicate/conflicting state transitions.

### Error Response Body
```json
{
  "error": {
    "code": "FR-025_CONFLICT",
    "message": "Request conflicts with current business rules.",
    "details": []
  }
}
```

## 4. Acceptance Criteria (Given - When - Then)

### Happy Path
1. **Given** valid permissions and required data exist, **when** the primary actor executes FR-025 workflow successfully, **then** the system persists results and returns the updated output.
2. **Given** records/configuration already exist, **when** the actor applies a valid update, **then** the system stores the change and reflects it in list/detail views.

### Edge Case / Error Handling
3. **Given** invalid input or business-rule conflict, **when** the actor submits the request, **then** the system rejects it with the appropriate validation/conflict response.
4. **Given** a user without required permission calls the feature endpoint, **when** authorization is evaluated, **then** the system returns `403 Forbidden` without side effects.
