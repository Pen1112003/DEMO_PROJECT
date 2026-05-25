# Skill: setup-fr-effort-chart

## Purpose
Set up effort visibility per FR using Project estimate data and a generated bar chart artifact.

## Inputs
- Project number
- `Estimate (days)` field values on FR items

## Steps
1. Ensure all FR items have `Estimate (days)`.
2. Create/ensure a Project single-select field `Functional Area`.
3. Populate `Functional Area` for each FR item using area mapping.
4. Export effort data by FR title + estimate.
5. Generate `doc/fr-effort-chart.md` with:
   - Table: FR, area, estimate
   - Mermaid bar chart for quick visual effort distribution

## Output
- Project field values ready for chart views.
- Markdown chart artifact committed in repository docs.
