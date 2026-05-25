// Sound Synth Engine using Web Audio API (no external file needed!)
let soundEnabled = true;

function playNotificationSound() {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Wave 1: futuristic cyber chime
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.15); // C6
    
    gain1.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.3);
    
    // Wave 2: cyber pulse
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
    osc2.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
    
    gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    
    osc2.start();
    osc2.stop(audioCtx.currentTime + 0.4);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
}

// Elements Cache
const elements = {
  feedList: document.getElementById('feed-list'),
  emptyState: document.getElementById('empty-state'),
  countEvents: document.getElementById('count-events'),
  connectionDot: document.getElementById('connection-dot'),
  connectionStatus: document.getElementById('connection-status'),
  btnFeed: document.getElementById('btn-feed'),
  btnMetrics: document.getElementById('btn-metrics'),
  btnSettings: document.getElementById('btn-settings'),
  viewFeed: document.getElementById('view-feed-container'),
  viewMetrics: document.getElementById('view-metrics-container'),
  viewSettings: document.getElementById('view-settings-container'),
  btnSoundToggle: document.getElementById('btn-sound-toggle'),
  toast: document.getElementById('feedback-toast'),
  btnLogin: document.getElementById('btn-login'),
  btnLogout: document.getElementById('btn-logout'),
  profileLoggedOut: document.getElementById('profile-logged-out'),
  profileLoggedIn: document.getElementById('profile-logged-in')
};

let eventCount = 0;

// Setup Live SSE Event Stream
function initSSE() {
  const eventSource = new EventSource('/api/events');
  
  eventSource.onopen = () => {
    console.log('[SSE] Stream established successfully.');
    elements.connectionDot.className = 'status-dot online pulsing';
    elements.connectionStatus.textContent = 'Streaming Live: Connected';
    showToast('📡 Connected to live GitHub events stream!');
  };
  
  eventSource.onerror = (err) => {
    console.error('[SSE] Stream error:', err);
    elements.connectionDot.className = 'status-dot pulsing';
    elements.connectionStatus.textContent = 'Disconnected. Reconnecting...';
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      appendNotification(data);
    } catch (e) {
      console.error('Failed to parse SSE payload:', e);
    }
  };
}

// Toast System
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  elements.toast.classList.remove('hidden');
  
  setTimeout(() => {
    elements.toast.classList.remove('visible');
    setTimeout(() => elements.toast.classList.add('hidden'), 300);
  }, 3000);
}

// Appending notifications dynamically
function appendNotification(data) {
  // Hide empty state
  if (elements.emptyState) {
    elements.emptyState.style.display = 'none';
  }
  
  eventCount++;
  elements.countEvents.textContent = eventCount;
  playNotificationSound();
  
  const card = document.createElement('div');
  card.className = `notification-card card-${data.eventType}`;
  
  let actionButtons = '';
  if (data.eventType === 'pull_request') {
    actionButtons = `
      <div class="card-actions">
        <button class="btn-action action-primary" onclick="simulateInteractiveAction('PR Merge approved!')">🟢 Approve Merge</button>
        <button class="btn-action" onclick="simulateInteractiveAction('Comment added successfully!')">💬 Review Comment</button>
      </div>
    `;
  } else if (data.eventType === 'project_v2_item') {
    actionButtons = `
      <div class="card-actions">
        <button class="btn-action action-primary" onclick="simulateInteractiveAction('Task verified on board!')">🔍 Verify Task</button>
        <button class="btn-action" onclick="simulateInteractiveAction('Assigned member updated!')">👤 Change Assignee</button>
      </div>
    `;
  } else if (data.eventType === 'issues') {
    actionButtons = `
      <div class="card-actions">
        <button class="btn-action action-primary" onclick="simulateInteractiveAction('Issue status: In Progress')">🔴 Start Progress</button>
        <button class="btn-action" onclick="simulateInteractiveAction('Issue closed!')">🟢 Close Issue</button>
      </div>
    `;
  }
  
  card.innerHTML = `
    <div class="card-header">
      <span class="badge-event">${data.eventType.replace(/_/g, ' ')}</span>
      <span class="event-time">${data.timestamp}</span>
    </div>
    <div class="card-body">${escapeHTML(data.message)}</div>
    ${actionButtons}
  `;
  
  // Insert at top of list
  elements.feedList.insertBefore(card, elements.feedList.firstChild);
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

function simulateInteractiveAction(successMsg) {
  showToast(`⚡ Action executed: ${successMsg}`);
  playNotificationSound();
}

// Nav Tab Switcher
function setupNavigation() {
  const tabs = [
    { btn: elements.btnFeed, view: elements.viewFeed },
    { btn: elements.btnMetrics, view: elements.viewMetrics },
    { btn: elements.btnSettings, view: elements.viewSettings }
  ];
  
  tabs.forEach(tab => {
    if (!tab.btn) return;
    tab.btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.btn.classList.remove('active');
        t.view.classList.add('hidden');
      });
      tab.btn.classList.add('active');
      tab.view.classList.remove('hidden');
    });
  });
}

// Simulation Endpoint Trigger
async function simulateEvent(eventType) {
  let mockPayload = {};
  
  if (eventType === 'project_v2_item') {
    mockPayload = {
      action: "edited",
      sender: { login: "Pen1112003" },
      project_v2_item: {
        content_title: "FR-005 Configure pricing and fee policies"
      },
      changes: {
        field_value: {
          field_name: "Status",
          from: "Todo",
          to: "In Progress"
        }
      }
    };
  } else if (eventType === 'pull_request') {
    mockPayload = {
      action: "opened",
      sender: { login: "Pen1112003" },
      pull_request: {
        title: "DEV FR-000: Add postinstall cleanup hook to standalone Zalo bridge",
        html_url: "https://github.com/Pen1112003/DEMO_PROJECT/pull/276"
      }
    };
  } else if (eventType === 'issues') {
    mockPayload = {
      action: "opened",
      sender: { login: "Pen1112003" },
      issue: {
        title: "CRITICAL: Database connection pool leakage on heavy queries",
        html_url: "https://github.com/Pen1112003/DEMO_PROJECT/issues/189"
      }
    };
  }
  
  showToast(`🚀 Sending mock ${eventType} to local server...`);
  
  try {
    const response = await fetch('/webhooks/github', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-Event': eventType
      },
      body: JSON.stringify(mockPayload)
    });
    
    if (response.ok) {
      showToast(`✅ Mock event delivered successfully!`);
    } else {
      showToast(`❌ Failed to deliver mock event`);
    }
  } catch (err) {
    showToast(`❌ Connection Refused: Is server running?`);
  }
}

// GitHub Login Simulation
function setupAuthSim() {
  elements.btnLogin.addEventListener('click', () => {
    elements.profileLoggedOut.classList.add('hidden');
    elements.profileLoggedIn.classList.remove('hidden');
    showToast('🔑 Successfully authenticated via GitHub!');
    playNotificationSound();
  });
  
  elements.btnLogout.addEventListener('click', () => {
    elements.profileLoggedIn.classList.add('hidden');
    elements.profileLoggedOut.classList.remove('hidden');
    showToast('🔒 Logged out of GitHub context.');
  });
}

// Sound toggle
elements.btnSoundToggle.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    elements.btnSoundToggle.textContent = '🔊';
    elements.btnSoundToggle.title = 'Âm thanh thông báo: Đang bật';
    showToast('🔊 Notification sound enabled.');
    playNotificationSound();
  } else {
    elements.btnSoundToggle.textContent = '🔇';
    elements.btnSoundToggle.title = 'Âm thanh thông báo: Đang tắt';
    showToast('🔇 Notification sound muted.');
  }
});

// Start App
setupNavigation();
setupAuthSim();
initSSE();

// Expose simulation helper globally
window.simulateEvent = simulateEvent;
window.simulateInteractiveAction = simulateInteractiveAction;
