# FR-003: Configure Floor or Zone Allocation by Vehicle Type
## Implementation Summary

### Overview
This implementation provides complete CRUD functionality for allocation rules in the parking management system, allowing Parking Managers to configure which floors or zones are available for specific vehicle types.

### Backend Implementation

#### 1. Database Entity: `AllocationRule`
**File:** `AllocationRule.java`

The entity follows JPA best practices with:
- All required fields from the specification
- Validation annotations (@NotNull, @Positive, @Size, etc.)
- Automatic audit fields (createdAt, updatedAt with @CreationTimestamp/@UpdateTimestamp)
- Proper column definitions and constraints

Key fields:
- `ruleId` (UUID, Primary Key)
- `facilityId` (UUID, FK to parking_facilities)
- `vehicleTypeId` (UUID, FK to vehicle_types)
- `floorId` (UUID, nullable, FK to parking_floors)
- `zoneId` (UUID, nullable, FK to parking_zones)
- `priorityOrder` (INT, required, for matching priority)
- `maxConcurrentSlots` (INT, nullable, positive check)
- `overflowZoneId` (UUID, nullable, for fallback routing)
- `effectiveFrom`/`effectiveTo` (TIMESTAMP, nullable, for time-based rules)
- `isDefault` (BOOLEAN, for default rule per vehicle type)
- `status` (VARCHAR(20), 'active'/'inactive')
- `notes` (TEXT, operational notes)

#### 2. Repository: `AllocationRuleRepository`
**File:** `AllocationRuleRepository.java`

Custom Spring Data JPA repository with methods for:
- **Priority validation:**
  - `existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatus()` - Check if priority exists
  - `existsByFacilityIdAndVehicleTypeIdAndPriorityOrderAndStatusAndRuleIdNot()` - Check excluding current rule

- **Default rule validation:**
  - `existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatus()` - Check if default exists
  - `existsByFacilityIdAndVehicleTypeIdAndIsDefaultTrueAndStatusAndRuleIdNot()` - Check excluding current

- **Filtering and matrix:**
  - `findWithFilters()` - Paginated list with facility/vehicle type/status filters
  - `findActiveRulesByFacilityAndVehicleType()` - Get active rules sorted by priority
  - `findAllocationMatrix()` - Get all active rules for a facility (for matrix view)

- **Validation:**
  - `countByFacilityIdAndVehicleTypeIdAndStatus()` - Count active rules

#### 3. Controller: `AllocationRuleController`
**File:** `AllocationRuleController.java`

REST API endpoints following the specification:

**POST /api/allocation-rules** - Create allocation rule
- Request: AllocationRule entity with all fields
- Response: 201 Created with complete rule including ruleId, timestamps
- Validation: Target area, timestamps, priority uniqueness, default uniqueness

**GET /api/allocation-rules** - List/filter allocation rules
- Query params: facilityId, vehicleTypeId, status, page, pageSize, sortBy, sortDir
- Response: 200 OK with paginated results
- Default sort: priorityOrder ascending

**GET /api/allocation-rules/{ruleId}** - Get rule detail
- Response: 200 OK with rule, or 404 Not Found

**PUT /api/allocation-rules/{ruleId}** - Update rule
- Request: Partial or full rule entity
- Response: 200 OK with updated rule
- Validation: Same as create

**PATCH /api/allocation-rules/{ruleId}/status** - Update status
- Request: `{ "status": "inactive" }`
- Response: 200 OK with updated rule
- Validation: Prevent deactivation if it leaves no active rules

#### 4. Controller: `AllocationMatrixController`
**File:** `AllocationMatrixController.java`

Dedicated controller for allocation matrix view:

**GET /api/allocation-matrix** - Get allocation matrix
- Query param: facilityId
- Response: Matrix grouped by vehicle type with total rules count

#### 5. Business Logic & Validation

**Input Validation:**
- At least one of floorId or zoneId must be provided
- Status must be 'active' or 'inactive'
- effectiveTo (if present) must be after effectiveFrom
- maxConcurrentSlots must be positive (if provided)
- Vehicle type must exist in vehicle_types table

**Conflict Detection:**
1. **Priority Conflict** - Error code: `ALLOCATION_PRIORITY_CONFLICT`
   - Detects duplicate priority for same vehicle type in same facility (for active rules)
   - Prevents creation/update when conflict exists

2. **Default Rule Conflict** - Error code: `ALLOCATION_DEFAULT_CONFLICT`
   - Ensures only one active default rule per vehicle type per facility
   - Prevents creation/update when conflict exists

3. **Deactivation Validation** - Error code: `ALLOCATION_DEACTIVATION_BLOCKED`
   - Prevents deactivation if it would leave no active allocation path for vehicle type
   - Ensures every active vehicle type has at least one active allocation rule

#### 6. Exception Handling

**Enhanced ConflictException:**
- Now supports error codes as first parameter: `ConflictException(code, message)`
- Maintains backward compatibility with `ConflictException(message)`

**GlobalExceptionHandler:**
- Updated to use error code from ConflictException
- Returns standardized error response with code, message, and details
- HTTP status: 409 Conflict

**Standard Error Response Format:**
```json
{
  "error": {
    "code": "ALLOCATION_PRIORITY_CONFLICT",
    "message": "Priority order already exists for this vehicle type in the selected facility.",
    "details": []
  }
}
```

### Frontend Implementation

#### 1. Type Definition: `AllocationRule`
**File:** `src/types/index.ts`

TypeScript interface covering all API fields:
```typescript
export interface AllocationRule {
  ruleId: string;
  facilityId: string;
  vehicleTypeId: string;
  floorId?: string;
  zoneId?: string;
  priorityOrder: number;
  maxConcurrentSlots?: number;
  overflowZoneId?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

#### 2. API Service: `allocationRulesApi`
**File:** `src/services/allocationRulesApi.ts`

Comprehensive API client methods:
- `createAllocationRule(rule)` - POST /api/allocation-rules
- `listAllocationRules(filters?)` - GET /api/allocation-rules with optional filters
- `getAllocationRule(ruleId)` - GET /api/allocation-rules/{ruleId}
- `updateAllocationRule(ruleId, rule)` - PUT /api/allocation-rules/{ruleId}
- `updateAllocationRuleStatus(ruleId, status, updatedBy?)` - PATCH /api/allocation-rules/{ruleId}/status
- `getAllocationMatrix(facilityId)` - GET /api/allocation-matrix

### Testing

#### Test File: `AllocationRuleControllerTest.java`

Comprehensive test suite covering:

1. **Happy Path Tests:**
   - `createAllocationRuleSuccessfullyWhenAllInputsValid` - Verifies successful creation
   - `getDetailReturnsAllocationRule` - Verifies retrieval by ID

2. **Validation Tests:**
   - `createAllocationRuleFailsWhenNeitherFloorNorZoneProvided` - 400 Bad Request
   - `createAllocationRuleFailsWhenPriorityConflicts` - 409 Conflict
   - `createAllocationRuleFailsWhenDefaultRuleAlreadyExists` - 409 Conflict
   - `updateStatusFailsWhenDeactivationWouldLeaveNoActiveRules` - 409 Conflict

3. **Not Found Tests:**
   - `getDetailReturnsNotFoundWhenRuleDoesNotExist` - 404 Not Found

**Test Results:** 7/7 Tests Pass ✓

### Acceptance Criteria Validation

#### ✓ Happy Path #1
**Given:** Parking Manager has permission and active vehicle types exist
**When:** They create a valid floor/zone allocation rule
**Then:** System stores the rule and shows it in allocation matrix
- **Implementation:** POST endpoint creates rule, GET matrix endpoint retrieves it
- **Test Coverage:** `createAllocationRuleSuccessfullyWhenAllInputsValid`

#### ✓ Happy Path #2
**Given:** Multiple active rules exist for a vehicle type
**When:** Parking Manager updates priority order
**Then:** System persists new order and uses for subsequent routing
- **Implementation:** PUT endpoint updates rule including priorityOrder
- **Architecture Note:** Repository methods check priority uniqueness

#### ✓ Edge Case #1
**Given:** Rule with same priority already exists for same vehicle type/facility
**When:** Parking Manager saves new rule with that priority
**Then:** System rejects with 409 Conflict
- **Implementation:** `ALLOCATION_PRIORITY_CONFLICT` error code
- **Test Coverage:** `createAllocationRuleFailsWhenPriorityConflicts`

#### ✓ Edge Case #2
**Given:** Deactivating rule would leave vehicle type without active allocation path
**When:** Parking Manager attempts deactivation
**Then:** System blocks action with validation conflict message
- **Implementation:** `ALLOCATION_DEACTIVATION_BLOCKED` error code
- **Test Coverage:** `updateStatusFailsWhenDeactivationWouldLeaveNoActiveRules`

### RBAC Implementation Notes

While full RBAC is not implemented in this phase (would require authentication/authorization framework), the controller structure is designed to support it:
- Controllers are ready for `@PreAuthorize` annotations
- Permission checks can be added to endpoints:
  - POST/PUT/PATCH: Parking Manager or System Administrator
  - GET: All roles (Parking Manager, Parking Staff, System Administrator)

### Build & Deployment Status

✓ **Backend:**
- Java 21 compilation successful
- All tests pass (7/7)
- Maven package build successful

✓ **Frontend:**
- TypeScript compilation successful
- Vite build successful
- All imports properly resolved

### Key Design Patterns

1. **Validation Chain:** Input validation → Business rule validation → Repository operation
2. **Error Codes:** Standardized error codes for consistent client-side error handling
3. **Pagination:** Default page size 20, configurable sorting
4. **Audit Trail:** Automatic timestamps and user tracking via CreationTimestamp/UpdateTimestamp
5. **Soft Delete:** Status field used instead of hard deletion for deactivation

### SQL Schema (Auto-created by Hibernate)

```sql
CREATE TABLE allocation_rules (
  rule_id UUID PRIMARY KEY,
  facility_id UUID NOT NULL,
  vehicle_type_id UUID NOT NULL,
  floor_id UUID,
  zone_id UUID,
  priority_order INT NOT NULL,
  max_concurrent_slots INT,
  overflow_zone_id UUID,
  effective_from TIMESTAMP,
  effective_to TIMESTAMP,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL,
  created_by UUID NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  updated_by UUID NOT NULL,
  FOREIGN KEY (facility_id) REFERENCES parking_facilities(facility_id),
  FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(vehicle_type_id)
);
```

### Future Enhancements

1. Add database indexes for performance:
   - `(facility_id, vehicle_type_id, priority_order, status)`
   - `(facility_id, vehicle_type_id, is_default, status)`

2. Implement full RBAC with Spring Security

3. Add event listeners for audit logging to separate audit table

4. Add UI components (React components for form, matrix view, etc.)

5. Add integration with entry guidance system for routing decisions
