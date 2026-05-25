# Acceptance Criteria

| ID | Related FR | Acceptance Criteria |
|---|---|---|
| AC-001 | FR-001 | Given the Parking Manager has valid access, when they create or edit parking facility information, then the system shall save the changes and display the updated facility data. |
| AC-002 | FR-002 | Given the Parking Manager is managing vehicle types, when they add, update, or remove a vehicle type, then the system shall persist the change and keep all related records consistent. |
| AC-003 | FR-003 | Given a vehicle type and parking zone list exist, when the Parking Manager configures floor or zone allocation, then the system shall store the rule and use it for vehicle guidance. |
| AC-004 | FR-004 | Given a slot exists, when the Parking Manager changes its status to free, occupied, reserved, maintenance, or locked, then the system shall update the slot state immediately. |
| AC-005 | FR-005 | Given pricing rules are defined, when the Parking Manager updates fee policies, then the system shall use the new rules for fee calculation on new sessions. |
| AC-006 | FR-006 | Given traffic data is available, when the Parking Manager opens the traffic report, then the system shall display entry and exit volumes by vehicle type. |
| AC-007 | FR-007 | Given completed parking sessions exist, when the Parking Manager opens the revenue report, then the system shall display revenue totals by vehicle type. |
| AC-008 | FR-008 | Given active and completed parking sessions exist, when the Parking Manager opens the occupancy report, then the system shall display slot utilization by vehicle type and zone. |
| AC-009 | FR-009 | Given recent session data exists, when the Parking Manager opens the peak-hour report, then the system shall display the busiest time ranges by vehicle type. |
| AC-010 | FR-010 | Given a lost ticket case is reported, when the Parking Manager records verification details, then the system shall store the case and mark its handling status. |
| AC-011 | FR-011 | Given the recorded plate does not match the vehicle record, when the Parking Manager flags the mismatch, then the system shall mark the session for exception handling. |
| AC-012 | FR-012 | Given a session exceeds the allowed parking time, when the Parking Manager reviews the case, then the system shall flag the session as overtime and allow penalty processing. |
| AC-013 | FR-013 | Given a vehicle is detected in the wrong zone, when the Parking Manager confirms the issue, then the system shall flag the session and support slot reassignment. |
| AC-014 | FR-014 | Given unpaid sessions exist, when the Parking Manager opens the unpaid list, then the system shall show only sessions with outstanding balances. |
| AC-015 | FR-015 | Given a vehicle arrives at the gate, when Parking Staff validate entry eligibility, then the system shall allow entry only if the vehicle meets the configured rules. |
| AC-016 | FR-016 | Given entry is approved, when Parking Staff capture or scan the license plate, then the system shall store the plate value in the new session. |
| AC-017 | FR-017 | Given an approved vehicle type and assigned zone exist, when Parking Staff guide the vehicle, then the system shall show the correct destination zone. |
| AC-018 | FR-018 | Given entry is approved, when Parking Staff create a parking session, then the system shall record entry time, vehicle type, and gate information. |
| AC-019 | FR-019 | Given an active parking session exists, when Parking Staff search by ticket, code, or plate, then the system shall return the matching session. |
| AC-020 | FR-020 | Given an active session is found, when Parking Staff record the exit time, then the system shall calculate the parking duration. |
| AC-021 | FR-021 | Given a session duration and fee policy exist, when Parking Staff calculate fees, then the system shall return the payable amount. |
| AC-022 | FR-022 | Given the payable amount is confirmed, when Parking Staff collect payment, then the system shall mark the session as paid and store the transaction. |
| AC-023 | FR-023 | Given a lost ticket case, when Parking Staff complete the verification flow, then the system shall allow exit only after the required checks are passed. |
| AC-024 | FR-024 | Given wrong vehicle information is identified, when Parking Staff correct the record, then the system shall update the session and keep an audit trail. |
| AC-025 | FR-025 | Given a session is overtime, when Parking Staff applies the overtime rule, then the system shall calculate and display the penalty amount. |
| AC-026 | FR-026 | Given a vehicle is in the wrong zone, when Parking Staff handle the exception, then the system shall support updating the session and slot assignment. |
| AC-027 | FR-027 | Given an exception is resolved, when Parking Staff update the slot status, then the system shall reflect the current availability immediately. |
| AC-028 | FR-028 | Given the Parking User/Driver opens facility information, when they view operating hours, then the system shall display the active schedule. |
| AC-029 | FR-029 | Given the Parking User/Driver opens facility information, when they view supported vehicle types, then the system shall display the accepted vehicle categories. |
| AC-030 | FR-030 | Given pricing rules exist, when the Parking User/Driver views the parking rules, then the system shall display the current pricing and policies. |
| AC-031 | FR-031 | Given available slots exist, when the Parking User/Driver checks availability, then the system shall show open slots by vehicle type. |
| AC-032 | FR-032 | Given entry is approved, when the vehicle enters the lot, then the system shall issue a ticket number or access code. |
| AC-033 | FR-033 | Given an exit session is ready for settlement, when the Parking User/Driver pays, then the system shall confirm the payment before exit completion. |
| AC-034 | FR-034 | Given reservation is enabled, when the Parking User/Driver reserves a slot, then the system shall block the slot for the chosen time window. |
| AC-035 | FR-035 | Given a parking session is active, when the Parking User/Driver views session details, then the system shall show entry time, zone, and estimated fee. |
| AC-036 | FR-036 | Given add-on services are used, when the Parking User/Driver pays for them, then the system shall include them in the final charge. |
| AC-037 | FR-037 | Given the Parking User/Driver submits an issue report, when the form is valid, then the system shall save the report and mark it for follow-up. |
| AC-038 | FR-038 | Given the System Administrator has permission, when they create or update a user account, then the system shall save the account and apply the configured access level. |
| AC-039 | FR-039 | Given roles are configured, when the System Administrator manages roles, then the system shall update role definitions and associated users. |
| AC-040 | FR-040 | Given permissions exist, when the System Administrator changes permissions, then the system shall enforce the new access rules immediately. |
| AC-041 | FR-041 | Given system settings are available, when the System Administrator updates configuration, then the system shall persist the changes and use them for subsequent operations. |
| AC-042 | FR-042 | Given AI slot allocation is enabled, when the system assigns a slot, then the system shall prefer the recommended slot to reduce search time and improve utilization. |
| AC-043 | FR-042 | Given the AI recommendation is unavailable or invalid, when the system assigns a slot, then the system shall fall back to the configured allocation rules without blocking entry. |
