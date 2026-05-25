import { execSync } from 'child_process';

const PROJECT_NUMBER = '14';
const PROJECT_ID = 'PVT_kwHOByW5DM4BYei8';
const OWNER = 'Pen1112003';
const START_DATE_FIELD = 'PVTF_lAHOByW5DM4BYei8zhTlFSo';
const DEADLINE_FIELD = 'PVTF_lAHOByW5DM4BYei8zhTlFSk';

console.log('Fetching items list from GitHub Project 14...');
const rawList = execSync(`gh project item-list ${PROJECT_NUMBER} --owner ${OWNER} --limit 100 --format json`).toString();
const data = JSON.parse(rawList);

// Filter and sort FR issues by their FR number (e.g. FR-001, FR-002)
const frItems = [];
data.items.forEach(item => {
  const match = (item.title || '').match(/FR-(\d{3})/i);
  if (match) {
    const frNum = parseInt(match[1], 10);
    frItems.push({
      frNum,
      itemId: item.id,
      title: item.title,
      estimate: parseInt(item["estimate (days)"] || '2', 10)
    });
  }
});

frItems.sort((a, b) => a.frNum - b.frNum);

console.log(`Found ${frItems.length} Functional Requirement issues to schedule.`);

// Base tracking date: we start FR-002 on 2026-05-28
let currentDate = new Date('2026-05-28');

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

frItems.forEach((item, index) => {
  // Keep FR-001 dates exactly as already set
  if (item.frNum === 1) {
    console.log(`[${index + 1}/${frItems.length}] FR-001 ("${item.title}") is already scheduled.`);
    return;
  }
  
  const startStr = formatDate(currentDate);
  
  // Calculate deadline: startDate + (estimate - 1) days
  const deadlineDate = new Date(currentDate);
  deadlineDate.setDate(currentDate.getDate() + (item.estimate - 1));
  const deadlineStr = formatDate(deadlineDate);
  
  console.log(`[${index + 1}/${frItems.length}] Scheduling ${item.title} -> Start: ${startStr} | Deadline: ${deadlineStr} (Estimate: ${item.estimate} days)...`);
  
  try {
    // Set Start Date
    execSync(`gh project item-edit --id "${item.itemId}" --field-id "${START_DATE_FIELD}" --project-id "${PROJECT_ID}" --date "${startStr}"`);
    
    // Set Deadline
    execSync(`gh project item-edit --id "${item.itemId}" --field-id "${DEADLINE_FIELD}" --project-id "${PROJECT_ID}" --date "${deadlineStr}"`);
    
    console.log(`✓ successfully scheduled.`);
  } catch (err) {
    console.error(`✗ failed to schedule: ${err.message}`);
  }
  
  // Update currentDate for the next FR: next start date is deadlineDate + 1 day
  currentDate = new Date(deadlineDate);
  currentDate.setDate(deadlineDate.getDate() + 1);
});

console.log('Project scheduling sweep completed successfully!');
