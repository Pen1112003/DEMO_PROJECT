# Backend Role Guide

## Role Scope
Backend is responsible for:
- Database schema and migrations.
- API contracts and business logic.
- Authentication, authorization, validation, and audit logs.
- Integration with reporting, pricing, exception handling, and AI allocation flows.

## How to Use This Role
1. Pick the assigned FR issue (`FR-xxx`) from GitHub Project.
2. Read FR spec in `doc/` and confirm API/data requirements.
3. Design/adjust schema first, then service logic, then endpoints.
4. Keep API response and error shape consistent for FE consumption.
5. Update issue with implementation notes before opening PR.

## Backend Development Rules
- Implement by FR boundary; avoid mixing unrelated FRs in one PR.
- Use soft-delete/deactivation when specs require history retention.
- Enforce RBAC and business constraints server-side.
- Return explicit status codes (`400/401/403/404/409`) with stable error codes.
- Keep changes traceable with audit fields (`createdAt/updatedAt/createdBy/updatedBy` where applicable).

## Push and Branch Rules
1. Branch naming:
   - `be/fr-xxx-short-name`
2. Commit naming:
   - `BE FR-xxx: <short summary>`
3. Push flow:
   - Push branch to origin.
   - Open PR to `main`.
   - Link FR issue and mention impacted endpoints/tables.
4. Merge policy:
   - Require review approval.
   - No direct push to `main`.

## PR Checklist (Backend)
- Linked FR issue.
- API endpoints documented in PR description.
- Schema/migration impact listed clearly.
- Error cases and RBAC behavior covered.
