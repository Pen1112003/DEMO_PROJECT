import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static assets for our custom GitBridge Desktop Console
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Load Google Chat credentials from environment
const GOOGLE_CHAT_WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL || 'YOUR_GOOGLE_CHAT_WEBHOOK_URL';

// In-memory clients for Server-Sent Events (SSE) real-time streaming
let sseClients = [];

// SSE endpoint to stream real-time webhook updates to the browser console
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);
  console.log(`[SSE] Client connected. Total clients: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
    console.log(`[SSE] Client disconnected. Total clients: ${sseClients.length}`);
  });
});

// Broadcast helper for SSE clients
function broadcastEvent(eventType, message, payload) {
  const dataPayload = {
    id: Date.now(),
    eventType,
    message,
    timestamp: new Date().toLocaleTimeString(),
    raw: payload
  };
  
  sseClients.forEach(client => {
    client.write('data: ' + JSON.stringify(dataPayload) + '\n\n');
  });
}

// Native macOS Desktop Notification Helper
function sendNativeNotification(title, subtitle, body) {
  const cleanTitle = title.replace(/"/g, '\\"').replace(/'/g, "\\'");
  const cleanSubtitle = subtitle.replace(/"/g, '\\"').replace(/'/g, "\\'");
  const cleanBody = body.replace(/"/g, '\\"').replace(/'/g, "\\'");
  
  const appleScript = `display notification "${cleanBody}" with title "${cleanTitle}" subtitle "${cleanSubtitle}"`;
  
  exec(`osascript -e '${appleScript}'`, (err) => {
    if (err) {
      console.error('[macOS Alert] Failed to trigger native notification:', err.message);
    } else {
      console.log(`[macOS Alert] Native desktop notification displayed.`);
    }
  });
}

app.post('/webhooks/github', async (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Received GitHub Webhook Event: ${eventType}`);

  try {
    let message = null;
    let notifyTitle = 'GitHub Notification';
    let notifySubtitle = '';
    let notifyBody = '';

    if (eventType === 'project_v2_item') {
      message = parseProjectV2ItemEvent(payload);
      if (payload.action === 'edited' && payload.changes && payload.changes.field_value) {
        const developer = payload.sender ? payload.sender.login : 'Developer';
        const taskTitle = payload.project_v2_item ? (payload.project_v2_item.content_title || 'Task') : 'Task';
        const fromStatus = payload.changes.field_value.from || 'Todo';
        const toStatus = payload.changes.field_value.to || 'In Progress';
        
        notifyTitle = '📋 Project Board - PBMS';
        notifySubtitle = `@${developer} updated task status`;
        notifyBody = `${taskTitle} (${fromStatus} -> ${toStatus})`;
      }
    } else if (eventType === 'pull_request') {
      message = parsePullRequestEvent(payload);
      const developer = payload.sender ? payload.sender.login : 'Developer';
      const title = payload.pull_request ? payload.pull_request.title : 'PR';
      
      notifyTitle = '🚀 Pull Request';
      if (payload.action === 'opened') {
        notifySubtitle = `New PR by @${developer}`;
        notifyBody = title;
      } else if (payload.action === 'closed') {
        const statusStr = payload.pull_request && payload.pull_request.merged ? 'Merged' : 'Closed';
        notifySubtitle = `PR ${statusStr} by @${developer}`;
        notifyBody = title;
      }
    } else if (eventType === 'issues') {
      message = parseIssueEvent(payload);
      const developer = payload.sender ? payload.sender.login : 'Developer';
      const title = payload.issue ? payload.issue.title : 'Issue';
      
      notifyTitle = '⚠️ Issue Opened';
      notifySubtitle = `New issue from @${developer}`;
      notifyBody = title;
    }

    if (message) {
      console.log(`Formatted Message for Google Chat: \n${message}`);
      
      // 1. Send to Google Chat
      await sendToGoogleChat(message);
      
      // 2. Broadcast to browser SSE console
      broadcastEvent(eventType, message, payload);
      
      // 3. Trigger native macOS desktop system notification popup!
      if (notifyTitle && notifyBody) {
        sendNativeNotification(notifyTitle, notifySubtitle, notifyBody);
      }
    }

    return res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing GitHub webhook:', error.message);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

function parseProjectV2ItemEvent(payload) {
  const { action, sender, project_v2_item, changes } = payload;
  if (action !== 'edited' || !changes || !changes.field_value) return null;

  const developer = sender ? sender.login : 'Lập trình viên';
  const taskTitle = project_v2_item ? (project_v2_item.content_title || 'Công việc mới') : 'Công việc mới';

  const fieldValue = changes.field_value;
  const fieldName = fieldValue.field_name;

  if (fieldName === 'Status') {
    let fromStatus = fieldValue.from || 'Chưa có';
    let toStatus = fieldValue.to || 'In Progress';

    let emoji = '🔵';
    if (toStatus.toLowerCase() === 'in progress') emoji = '🔴';
    else if (toStatus.toLowerCase() === 'ready to review') emoji = '🟡';
    else if (toStatus.toLowerCase() === 'done') emoji = '🟢';

    return `🔔 *[THÔNG BÁO DỰ ÁN - PBMS]*\n` +
           `👤 *Lập trình viên:* @${developer} vừa chuyển trạng thái công việc:\n` +
           `📋 *Task:* ${taskTitle}\n` +
           `🔄 *Trạng thái:* \`${fromStatus}\` ➡️ *\`${toStatus}\`* ${emoji}\n` +
           `🔗 *Xem chi tiết trên GitProject:* https://github.com/users/Pen1112003/projects/14`;
  }

  return null;
}

function parsePullRequestEvent(payload) {
  const { action, pull_request, sender } = payload;
  if (!pull_request) return null;

  const title = pull_request.title;
  const prUrl = pull_request.html_url;
  const developer = sender ? sender.login : 'Lập trình viên';

  if (action === 'opened') {
    return `🚀 *[PULL REQUEST MỚI ĐƯỢC TẠO]*\n` +
           `👤 *Người tạo:* @${developer}\n` +
           `📝 *Tiêu đề:* ${title}\n` +
           `🚦 *Trạng thái:* Đang chờ kiểm duyệt 🟡\n` +
           `🔗 *Xem chi tiết:* ${prUrl}`;
  } else if (action === 'closed') {
    const status = pull_request.merged ? 'Đã được MERGE vào main 🟢' : 'Đã bị ĐÓNG (Không merge) 🔴';
    return `🏁 *[PULL REQUEST ĐÃ KẾT THÚC]*\n` +
           `👤 *Người xử lý:* @${developer}\n` +
           `📝 *Tiêu đề:* ${title}\n` +
           `🚦 *Kết quả:* ${status}\n` +
           `🔗 *Xem chi tiết:* ${prUrl}`;
  }
  return null;
}

function parseIssueEvent(payload) {
  const { action, issue, sender } = payload;
  if (!issue) return null;

  const title = issue.title;
  const issueUrl = issue.html_url;
  const developer = sender ? sender.login : 'Lập trình viên';

  if (action === 'opened') {
    return `⚠️ *[PHÁT SINH CÔNG VIỆC/YÊU CẦU MỚI]*\n` +
           `👤 *Người tạo:* @${developer}\n` +
           `📋 *Nội dung:* ${title}\n` +
           `🚦 *Trạng thái:* Mở mới (Opened) 🔴\n` +
           `🔗 *Xem chi tiết:* ${issueUrl}`;
  }
  return null;
}

async function sendToGoogleChat(text) {
  if (GOOGLE_CHAT_WEBHOOK_URL === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL') {
    console.warn('[Google Chat] Integration not configured. Skipping API request.');
    return;
  }

  try {
    const payload = {
      text: text
    };

    const response = await axios.post(GOOGLE_CHAT_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    if (response.status === 200 || response.status === 201) {
      console.log('[Google Chat] Notification delivered successfully.');
    } else {
      console.error('[Google Chat] Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('[Google Chat] API call failed:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`GitHub to Google Chat Bridge microservice listening on port ${PORT}`);
});
