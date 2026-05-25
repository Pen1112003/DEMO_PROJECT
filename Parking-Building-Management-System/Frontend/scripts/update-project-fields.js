import { execSync } from 'child_process';

const optionMap = {
  // Foundation (id: "33956ba6")
  'FR-001': '33956ba6', 'FR-002': '33956ba6', 'FR-003': '33956ba6', 'FR-004': '33956ba6', 'FR-005': '33956ba6',
  // Reporting (id: "b45dd424")
  'FR-006': 'b45dd424', 'FR-007': 'b45dd424', 'FR-008': 'b45dd424', 'FR-009': 'b45dd424',
  // Exceptions (id: "57a529ce")
  'FR-010': '57a529ce', 'FR-011': '57a529ce', 'FR-012': '57a529ce', 'FR-013': '57a529ce', 'FR-014': '57a529ce',
  // Staff Operations (id: "7f203369")
  'FR-015': '7f203369', 'FR-016': '7f203369', 'FR-017': '7f203369', 'FR-018': '7f203369', 'FR-019': '7f203369',
  'FR-020': '7f203369', 'FR-021': '7f203369', 'FR-022': '7f203369', 'FR-023': '7f203369', 'FR-024': '7f203369',
  'FR-025': '7f203369', 'FR-026': '7f203369', 'FR-027': '7f203369',
  // Driver Experience (id: "8a344bda")
  'FR-028': '8a344bda', 'FR-029': '8a344bda', 'FR-030': '8a344bda', 'FR-031': '8a344bda', 'FR-032': '8a344bda',
  'FR-033': '8a344bda', 'FR-034': '8a344bda', 'FR-035': '8a344bda', 'FR-036': '8a344bda', 'FR-037': '8a344bda',
  // Admin (id: "791b490a")
  'FR-038': '791b490a', 'FR-039': '791b490a', 'FR-040': '791b490a', 'FR-041': '791b490a',
  // AI Optimization (id: "da378fb9")
  'FR-042': 'da378fb9'
};

const PROJECT_NUMBER = '14';
const PROJECT_ID = 'PVT_kwHOByW5DM4BYei8';
const OWNER = 'Pen1112003';
const FIELD_ID = 'PVTSSF_lAHOByW5DM4BYei8zhTuKko'; // Functional Area Field ID

console.log('Fetching items list from GitHub Project 14...');
const rawList = execSync(`gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --limit 100 --format json`).toString();
const data = JSON.parse(rawList);

console.log(`Found ${data.items.length} items in the project board.`);

data.items.forEach((item, index) => {
  const title = item.title || '';
  const itemId = item.id;
  
  // Find FR prefix (e.g. FR-001)
  const match = title.match(/FR-\d{3}/i);
  if (match) {
    const frCode = match[0].toUpperCase();
    const optionId = optionMap[frCode];
    if (optionId) {
      console.log(`[${index + 1}/${data.items.length}] Mapping ${frCode} ("${title}") to Option ID: ${optionId}...`);
      try {
        execSync(`gh project item-edit --id "${itemId}" --field-id "${FIELD_ID}" --project-id "${PROJECT_ID}" --single-select-option-id "${optionId}"`);
        console.log(`✓ successfully mapped.`);
      } catch (err) {
        console.error(`✗ failed to map: ${err.message}`);
      }
    }
  } else {
    console.log(`Skipping non-FR item: "${title}"`);
  }
});

console.log('Project synchronization sweep completed successfully!');
