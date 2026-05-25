# FR-006 | View traffic volume reports by vehicle type

**Target requirement:** FR-006 — The system shall provide traffic volume reports by vehicle type.

## 1. Functional & Business Logic Analysis

### CRUD Matrix
| Action | Scope |
|---|---|
| Create | Generate report snapshots from parking session data. |
| Read | View traffic volume metrics by vehicle type and time bucket. |
| Update | Refresh/recompute report output when filters/time range changes. |
| Delete | Not applicable for source sessions; optional snapshot cleanup by retention policy. |

### Data Dictionary / Fields
| Field | Type | Required | Notes |
|---|---|---:|---|
| reportId | UUID | No | Optional persisted snapshot ID. |
| facilityId | UUID | Yes | Report scope. |
| vehicleTypeId | UUID | Yes | Grouping key. |
| vehicleTypeCode | string | Yes | Display grouping label. |
| periodStart | datetime | Yes | Range start. |
| periodEnd | datetime | Yes | Range end. |
| timeBucket | enum | Yes | `hour`, `day`, `week`, `month`. |
| entryCount | integer | Yes | Number of session entries. |
| exitCount | integer | Yes | Number of session exits. |
| netFlow | integer | Yes | `entryCount - exitCount`. |
| generatedAt | datetime | Yes | Generation timestamp. |
| generatedBy | UUID | No | User who requested report. |

### Business Rules & Constraints
1. Reporting counts must be derived from authoritative parking session events.
2. `periodEnd` must be greater than `periodStart`.
3. Only completed/valid event records are counted; canceled/invalid sessions excluded.
4. Timezone-aware aggregation must use facility timezone.
5. Vehicle types with zero traffic may be shown when `includeZero=true`.
6. Large ranges require bucket granularity constraints to protect performance.

### RBAC
| Role | Permissions |
|---|---|
| Parking Manager | Full report access and export. |
| System Administrator | Full access across facilities. |
| Parking Staff | Read access for operational monitoring. |
| Parking User/Driver | No access to internal traffic reports. |

Unauthorized access returns `403 Forbidden`.

## 2. Front-End Specifications (FE)

### UI/UX Layout & Wireframe Concept
1. Traffic report dashboard with KPI cards and trend chart.
2. Filter panel: facility, vehicle type(s), date range, bucket.
3. Table view with grouped counts and export action.

### Components & Interactive Controls
- Date range picker.
- Multi-select vehicle type filter.
- Bucket selector (`hour/day/week/month`).
- KPI cards: total entries, total exits, net flow.
- Line/bar chart for trend.
- CSV/XLSX export button.

### Client-Side Validation
- Require valid date range.
- Prevent requesting oversized ranges with too-fine bucket.
- Disable refresh while query is in-flight.

### UX States
- Loading skeleton for chart/table.
- Empty state when no data.
- Error banner for query failures.
- Success toast after export generation.

## 3. Back-End Specifications (BE)

### Database Schema Design
Primary data source is `parking_sessions` (entry/exit timestamps, vehicle type, facility).

Optional materialized table for acceleration:

**Table: `traffic_volume_daily`**

| Column | Type | Constraints |
|---|---|---|
| agg_date | DATE | PK part |
| facility_id | UUID | PK part |
| vehicle_type_id | UUID | PK part |
| entry_count | INT | NOT NULL DEFAULT 0 |
| exit_count | INT | NOT NULL DEFAULT 0 |
| generated_at | TIMESTAMP | NOT NULL |

### RESTful API Contract
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/reports/traffic-volume` | Query traffic volume report. |
| GET | `/api/reports/traffic-volume/export` | Export report data. |

**GET /api/reports/traffic-volume**
- Auth: Parking Manager, Parking Staff, System Administrator.
- Query params:
  - `facilityId` (required)
  - `vehicleTypeIds` (optional csv)
  - `from` (required, ISO datetime)
  - `to` (required, ISO datetime)
  - `bucket` (`hour|day|week|month`)
  - `includeZero` (`true|false`)
- Success `200 OK`:
```json
{
  "meta": {
    "facilityId": "uuid",
    "from": "2026-05-01T00:00:00Z",
    "to": "2026-05-24T23:59:59Z",
    "bucket": "day",
    "generatedAt": "2026-05-24T13:00:00Z"
  },
  "data": [
    {
      "bucketStart": "2026-05-24T00:00:00Z",
      "vehicleTypeId": "uuid",
      "vehicleTypeCode": "CAR",
      "entryCount": 124,
      "exitCount": 118,
      "netFlow": 6
    }
  ]
}
```

### Exception Handling & HTTP Status Codes
- `400 Bad Request` for invalid date range/bucket.
- `401 Unauthorized` for missing auth.
- `403 Forbidden` for unauthorized role.
- `404 Not Found` for unknown facility.
- `422 Unprocessable Entity` for range too large under selected bucket.

### Error Response Body
```json
{
  "error": {
    "code": "REPORT_RANGE_TOO_LARGE",
    "message": "Selected range is too large for hourly bucket.",
    "details": []
  }
}
```

## 4. Acceptance Criteria (Given - When - Then)

### Happy Path
1. **Given** report data exists, **when** the Parking Manager requests traffic volume by day and vehicle type, **then** the system shows entry and exit counts for each bucket.
2. **Given** the report is displayed, **when** the Parking Manager exports it, **then** the system provides a downloadable file containing the filtered data.

### Edge Case / Error Handling
3. **Given** the user submits an invalid date range (`from >= to`), **when** the API processes the request, **then** the system returns `400 Bad Request`.
4. **Given** a user without report permission calls the endpoint, **when** authentication succeeds but role check fails, **then** the system returns `403 Forbidden`.
