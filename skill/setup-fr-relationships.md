# Skill: setup-fr-relationships

## Purpose
Create explicit parent-child relationships for all FR issues so planning views can show hierarchy and dependency order.

## Inputs
- Repository: `owner/repo`
- Parent epic issue title
- FR issue list

## Steps
1. Create (or reuse) one parent Epic issue, e.g. `EPIC: FR-001..FR-042 Delivery`.
2. For each FR issue, add it as a sub-issue of the Epic using GraphQL `addSubIssue`.
3. Verify all FR issues are linked as children.
4. Confirm Project `Parent issue` field reflects the Epic relationship.

## Notes
- Keep one Epic parent for portfolio-level tracking.
- Use milestone and labels in parallel for slicing by release and domain.
