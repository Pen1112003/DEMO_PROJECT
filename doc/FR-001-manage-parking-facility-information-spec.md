# FR-001 | Manage parking facility information

**Target requirement:** FR-001 — The system shall allow the Parking Manager to manage parking facility information.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Create a new parking facility record with core metadata. |
| Read | View facility details, including active/inactive state and configuration summary. |
| Update | Edit facility metadata, contact data, status, and operational settings. |
| Deactivate | Mark a facility as inactive/archived instead of hard delete to preserve audit history. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| facilityId | UUID | Yes | Primary key. |
| facilityCode | string | Yes | Unique, stable business identifier. |
| facilityName | string | Yes | Display name of the parking facility. |
| buildingName | string | No | Optional building label if different from facility name. |
| addressLine1 | string | Yes | Main address line. |
| addressLine2 | string | No | Secondary address line. |
| city | string | Yes | City or province. |
| stateOrRegion | string | No | Administrative region if applicable. |
| postalCode | string | No | Postal or ZIP code. |
| country | string | Yes | ISO country name/code. |
| timezone | string | Yes | IANA timezone identifier. |
| contactPhone | string | No | Public contact number. |
| contactEmail | string | No | Public contact email. |
| totalFloors | integer | No | Cached facility summary value. |
| totalZones | integer | No | Cached facility summary value. |
| status | enum | Yes | `draft`, `active`, `inactive`, `archived`. |
| notes | text | No | Operational notes. |
| createdAt | datetime | Yes | Audit field. |
| createdBy | UUID | Yes | Audit field. |
| updatedAt | datetime | Yes | Audit field. |
| updatedBy | UUID | Yes | Audit field. |

### Business Rules & Constraints
1. `facilityCode` must be unique and immutable after the record becomes active unless a privileged admin explicitly changes it.
2. `facilityName`, `addressLine1`, `city`, `country`, and `timezone` are mandatory.
3. `timezone` must be a valid IANA timezone value.
4. `contactEmail`, if present, must follow email format rules.
5. `contactPhone`, if present, must follow the system’s phone validation policy.
6. Soft delete is required; the system must retain history for operational and audit purposes.
7. Only one facility can be designated as the primary active facility if the deployment is configured for a single-site mode.
8. Deactivated facilities must not be available for new operational workflows.
9. Updates to core facility information must be audit logged.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Create, read, update, deactivate facility information. |
| System Administrator | Full access, including recovery and configuration-level overrides. |
| Parking Staff | Read-only access to facility details. |
| Parking User/Driver | Read-only access to public-facing facility information only. |

Unauthorized access must return `403 Forbidden`.

## 2. Front-End Specifications

### Screens / Views
1. Facility overview page with current facility summary.
2. Create/Edit facility form in modal or full-page editor.
3. Read-only public facility details panel for drivers.

### Components
- Search or selector if multiple facilities are supported.
- Form inputs for text, email, phone, timezone, and status.
- Save, cancel, deactivate, and restore actions.
- Inline validation messages and confirmation dialogs for deactivation.

### Client-Side Validation
- Required-field validation before submit.
- Email and phone format checks.
- Character limits for code and name fields.
- Disable save while submission is pending.

### UX States
- Skeleton/loading state while fetching the facility record.
- Success toast after save.
- Error toast with field-level feedback for validation failures.
- Confirmation prompt before deactivation.

## 3. Back-End Specifications

### Database Schema
**Table: `parking_facilities`**

| Column | Type | Constraints |
|---|---|---|
| facility_id | UUID | PK |
| facility_code | VARCHAR(50) | NOT NULL, UNIQUE |
| facility_name | VARCHAR(120) | NOT NULL |
| building_name | VARCHAR(120) | NULL |
| address_line1 | VARCHAR(255) | NOT NULL |
| address_line2 | VARCHAR(255) | NULL |
| city | VARCHAR(100) | NOT NULL |
| state_or_region | VARCHAR(100) | NULL |
| postal_code | VARCHAR(20) | NULL |
| country | VARCHAR(100) | NOT NULL |
| timezone | VARCHAR(64) | NOT NULL |
| contact_phone | VARCHAR(30) | NULL |
| contact_email | VARCHAR(255) | NULL |
| total_floors | INT | NULL |
| total_zones | INT | NULL |
| status | VARCHAR(20) | NOT NULL |
| notes | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |
| created_by | UUID | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |
| updated_by | UUID | NOT NULL |

### REST API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/facilities` | Create facility record. |
| GET | `/api/facilities/{facilityId}` | Get facility details. |
| PUT | `/api/facilities/{facilityId}` | Update facility metadata. |
| PATCH | `/api/facilities/{facilityId}/status` | Activate, deactivate, or archive a facility. |
| GET | `/api/facilities/public/current` | Read-only public facility info. |

**POST /api/facilities**
- Request body: `facilityCode`, `facilityName`, `addressLine1`, `city`, `country`, `timezone`, optional contact fields and notes.
- Success response: `201 Created` with the persisted facility object.

**PUT /api/facilities/{facilityId}**
- Request body: editable facility fields excluding immutable identifiers.
- Success response: `200 OK` with the updated facility object.

**PATCH /api/facilities/{facilityId}/status**
- Request body: `{ "status": "inactive" }` or `{ "status": "archived" }`.
- Success response: `200 OK` with the updated status.

**GET /api/facilities/{facilityId}**
- Success response: `200 OK` with full facility details and audit metadata.

### Error Handling
- `400 Bad Request` for validation errors.
- `401 Unauthorized` for missing authentication.
- `403 Forbidden` for role mismatch.
- `404 Not Found` for missing facility.
- `409 Conflict` for duplicate facility code or invalid state transition.

### Error Response Shape
```json
{
  "error": {
    "code": "FACILITY_CODE_EXISTS",
    "message": "Facility code already exists.",
    "details": []
  }
}
```

## 4. Acceptance Criteria

### Happy Path
1. **Given** the Parking Manager has permission, **when** they create a facility with valid data, **then** the system stores the record and shows the saved facility details.
2. **Given** an active facility exists, **when** the Parking Manager edits valid fields and saves, **then** the system persists the update and refreshes the displayed data.

### Edge Cases / Error Handling
3. **Given** the facility code already exists, **when** the Parking Manager submits the form, **then** the system rejects the request with a duplicate conflict message.
4. **Given** the user does not have facility-management permission, **when** they attempt to update facility data, **then** the system denies the action with a forbidden response.
