# Frontend Role Guide

## Role Scope
Frontend is responsible for:
- UI screens, forms, dashboards, and interaction flows by FR.
- Client-side validations and UX state handling.
- Integration with backend APIs and error feedback display.
- Consistent role-based UI behavior (Manager/Staff/Driver/Admin).

## How to Use This Role
1. Pick the assigned FR issue (`FR-xxx`) from GitHub Project.
2. Read FR spec in `doc/` and map required screens/components.
3. Build UI flow in this order: layout -> interaction -> API integration -> error states.
4. Keep field names and payloads aligned with backend contract.
5. Update issue with screenshots or flow notes before opening PR.

## Frontend Development Rules
- Implement by FR boundary; avoid unrelated UI changes in the same PR.
- Include loading, empty, success, and error states for each async action.
- Enforce input validation before request submission.
- Keep permission-sensitive actions hidden/disabled based on role.
- Use consistent labels, status text, and feedback patterns.

## Push and Branch Rules
1. Branch naming:
   - `fe/fr-xxx-short-name`
2. Commit naming:
   - `FE FR-xxx: <short summary>`
3. Push flow:
   - Push branch to origin.
   - Open PR to `main`.
   - Link FR issue and include UI change summary.
4. Merge policy:
   - Require review approval.
   - No direct push to `main`.

## PR Checklist (Frontend)
- Linked FR issue.
- Screens/components changed are listed.
- API integration points are listed.
- UX states and validation behavior are described.
