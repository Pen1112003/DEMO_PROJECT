# Skill: setup-fr-governance

## Purpose
Configure repository governance metadata for Functional Requirement (FR) issues:
- Labels
- Milestone
- Project status alignment

## Inputs
- Repository: `owner/repo`
- FR issue range (example: `#146..#187`)
- Milestone title and due date

## Steps
1. Ensure labels exist:
   - `functional-requirement`
   - `area:foundation`
   - `area:reporting`
   - `area:exceptions`
   - `area:staff-operations`
   - `area:driver`
   - `area:admin`
   - `area:ai`
2. Create milestone if missing.
3. Apply baseline label + area label to each FR issue by mapping.
4. Assign milestone to all FR issues.
5. Confirm all FR issues have labels + milestone.

## FR Area Mapping
- FR-001..FR-005 -> `area:foundation`
- FR-006..FR-009 -> `area:reporting`
- FR-010..FR-014 -> `area:exceptions`
- FR-015..FR-027 -> `area:staff-operations`
- FR-028..FR-037 -> `area:driver`
- FR-038..FR-041 -> `area:admin`
- FR-042 -> `area:ai`
