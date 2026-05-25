// Elements Cache
const elements = {
  logList: document.getElementById('log-list'),
  webhookCount: document.getElementById('webhook-count'),
  toast: document.getElementById('feedback-toast')
};

let eventCount = 0;

// Setup Live SSE Event Stream
function initSSE() {
  const eventSource = new EventSource('/api/events');
  
  eventSource.onopen = () => {
    appendLog('[SYSTEM] SSE channel successfully opened. Ready to receive events.');
    showToast('📡 Connected to live GitHub events stream.');
  };
  
  eventSource.onerror = (err) => {
    console.error('[SSE] Stream error:', err);
    appendLog('[ERROR] SSE stream disconnected. Retrying connection...');
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleIncomingWebhook(data);
    } catch (e) {
      console.error('Failed to parse SSE payload:', e);
    }
  };
}

// Toast Notifications
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  elements.toast.classList.remove('hidden');
  
  setTimeout(() => {
    elements.toast.classList.remove('visible');
    setTimeout(() => elements.toast.classList.add('hidden'), 300);
  }, 2000);
}

// Append log lines inside scrollable panel
function appendLog(text, className = '') {
  const logLine = document.createElement('div');
  logLine.className = `log-line ${className}`;
  logLine.textContent = text;
  elements.logList.appendChild(logLine);
  
  // Auto scroll console
  const consolePanel = elements.logList.parentElement;
  consolePanel.scrollTop = consolePanel.scrollHeight;
}

// Handle incoming GitHub webhook messages
function handleIncomingWebhook(data) {
  eventCount++;
  elements.webhookCount.textContent = eventCount;
  
  const timestamp = data.timestamp || new Date().toLocaleTimeString();
  const summaryLine = data.message.split('\n')[1] || data.message;
  
  appendLog(`[${timestamp}] [EVENT: ${data.eventType.toUpperCase()}] ${summaryLine}`, 'webhook-msg');
}

// Simulated triggers
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
  
  showToast(`Mocking ${eventType}...`);
  appendLog(`[MOCK] Dispatching mock ${eventType} to /webhooks/github...`);
  
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
      showToast(`Mock event delivered.`);
    } else {
      appendLog(`[ERROR] Server responded with status: ${response.status}`);
    }
  } catch (err) {
    appendLog(`[ERROR] Connection failed: Is server listening on port 3000?`);
  }
}

// Run
initSSE();

// Expose simulation helper globally
window.simulateEvent = simulateEvent;
