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

// Native macOS Desktop Notification Helper (AppleScript)
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
    let cardPayload = null;
    let textFallbackMessage = '';
    
    let notifyTitle = 'GitHub Notification';
    let notifySubtitle = '';
    let notifyBody = '';

    if (eventType === 'project_v2_item') {
      const developer = payload.sender ? payload.sender.login : 'Developer';
      const taskTitle = payload.project_v2_item ? (payload.project_v2_item.content_title || 'Task') : 'Task';
      
      if (payload.action === 'edited' && payload.changes && payload.changes.field_value) {
        const fromStatus = payload.changes.field_value.from || 'Todo';
        const toStatus = payload.changes.field_value.to || 'In Progress';
        
        notifyTitle = '📋 Project Board - PBMS';
        notifySubtitle = `@${developer} updated task status`;
        notifyBody = `${taskTitle} (${fromStatus} -> ${toStatus})`;
        textFallbackMessage = `📋 Task: ${taskTitle} | Status: ${fromStatus} -> ${toStatus}`;

        cardPayload = createGoogleChatCard(
          '📋 Project Board - PBMS',
          `@${developer} updated task status`,
          'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/assignment/default/48px.svg',
          [
            {
              textParagraph: {
                text: `<b>Task:</b> ${taskTitle}<br><b>Status:</b> <code>${fromStatus}</code> ➡️ <b><code>${toStatus}</code></b>`
              }
            },
            {
              buttonList: {
                buttons: [
                  {
                    text: 'Open Project Board',
                    onClick: {
                      openLink: {
                        url: 'https://github.com/users/Pen1112003/projects/14'
                      }
                    }
                  }
                ]
              }
            }
          ]
        );
      }
    } else if (eventType === 'pull_request') {
      const developer = payload.sender ? payload.sender.login : 'Developer';
      const title = payload.pull_request ? payload.pull_request.title : 'PR';
      const prUrl = payload.pull_request ? payload.pull_request.html_url : 'https://github.com';
      
      notifyTitle = '🚀 Pull Request';
      let statusStr = 'PR Event';
      
      if (payload.action === 'opened') {
        statusStr = 'Opened';
        notifySubtitle = `New PR by @${developer}`;
        notifyBody = title;
        textFallbackMessage = `🚀 New PR by @${developer}: ${title}`;
      } else if (payload.action === 'closed') {
        const merged = payload.pull_request && payload.pull_request.merged;
        statusStr = merged ? 'Merged 🟢' : 'Closed 🔴';
        notifySubtitle = `PR ${statusStr} by @${developer}`;
        notifyBody = title;
        textFallbackMessage = `🏁 PR ${statusStr} by @${developer}: ${title}`;
      }

      cardPayload = createGoogleChatCard(
        '🚀 Pull Request Notification',
        `PR ${statusStr} by @${developer}`,
        'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/source/default/48px.svg',
        [
          {
            textParagraph: {
              text: `<b>Title:</b> ${title}<br><b>Status:</b> <b>${statusStr}</b>`
            }
          },
          {
            buttonList: {
              buttons: [
                {
                  text: 'View Pull Request',
                  onClick: {
                    openLink: {
                      url: prUrl
                    }
                  }
                }
              ]
            }
          }
        ]
      );
    } else if (eventType === 'issues') {
      let message = parseIssueEvent(payload);
      const developer = payload.sender ? payload.sender.login : 'Developer';
      const title = payload.issue ? payload.issue.title : 'Issue';
      const issueUrl = payload.issue ? payload.issue.html_url : 'https://github.com';
      
      let statusStr = 'Issue';
      
      if (payload.action === 'opened') {
        notifyTitle = '⚠️ Issue Opened';
        notifySubtitle = `New issue from @${developer}`;
        notifyBody = title;
        textFallbackMessage = `⚠️ New Issue by @${developer}: ${title}`;
        statusStr = 'Active (Opened) 🔴';
      } else if (payload.action === 'closed') {
        notifyTitle = '✅ Issue Closed';
        notifySubtitle = `Issue resolved by @${developer}`;
        notifyBody = title;
        textFallbackMessage = `✅ Issue resolved by @${developer}: ${title}`;
        statusStr = 'Resolved (Closed) 🟢';
      } else if (payload.action === 'reopened') {
        notifyTitle = '🔄 Issue Reopened';
        notifySubtitle = `Issue reopened by @${developer}`;
        notifyBody = title;
        textFallbackMessage = `🔄 Issue reopened by @${developer}: ${title}`;
        statusStr = 'Reopened 🟡';
      }

      if (message) {
        cardPayload = createGoogleChatCard(
          notifyTitle,
          notifySubtitle,
          'https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/warning/default/48px.svg',
          [
            {
              textParagraph: {
                text: `<b>Issue:</b> ${title}<br><b>Status:</b> <b>${statusStr}</b>`
              }
            },
            {
              buttonList: {
                buttons: [
                  {
                    text: 'View Issue details',
                    onClick: {
                      openLink: {
                        url: issueUrl
                      }
                    }
                  }
                ]
              }
            }
          ]
        );
      }
    }

    if (cardPayload) {
      console.log('[Google Chat] Dispatched payload matches modern CardsV2 API.');
      
      // 1. Send to Google Chat using the modern CardsV2 layout
      await sendToGoogleChat(cardPayload);
      
      // 2. Broadcast plain text to the local browser monitoring console
      broadcastEvent(eventType, textFallbackMessage, payload);
      
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

// Helper function to synthesize a modern Google Chat cardsV2 message
function createGoogleChatCard(title, subtitle, iconUrl, widgets) {
  return {
    cardsV2: [
      {
        cardId: 'github_bridge_event_' + Date.now(),
        card: {
          header: {
            title: title,
            subtitle: subtitle,
            imageUrl: iconUrl,
            imageType: 'CIRCLE'
          },
          sections: [
            {
              collapsible: false,
              widgets: widgets
            }
          ]
        }
      }
    ]
  };
}

async function sendToGoogleChat(payload) {
  if (GOOGLE_CHAT_WEBHOOK_URL === 'YOUR_GOOGLE_CHAT_WEBHOOK_URL') {
    console.warn('[Google Chat] Integration not configured. Skipping API request.');
    return;
  }

  try {
    const response = await axios.post(GOOGLE_CHAT_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    if (response.status === 200 || response.status === 201) {
      console.log('[Google Chat] CardsV2 notification delivered successfully.');
    } else {
      console.error('[Google Chat] Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('[Google Chat] API call failed:', error.message);
  }
}

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
  } else if (action === 'closed') {
    return `✅ *[CÔNG VIỆC/YÊU CẦU ĐÃ ĐƯỢC XỬ LÝ]*\n` +
           `👤 *Người xử lý:* @${developer}\n` +
           `📋 *Nội dung:* ${title}\n` +
           `🚦 *Trạng thái:* Đã đóng (Closed) 🟢\n` +
           `🔗 *Xem chi tiết:* ${issueUrl}`;
  } else if (action === 'reopened') {
    return `🔄 *[CÔNG VIỆC/YÊU CẦU ĐƯỢC MỞ LẠI]*\n` +
           `👤 *Người mở lại:* @${developer}\n` +
           `📋 *Nội dung:* ${title}\n` +
           `🚦 *Trạng thái:* Mở lại (Reopened) 🟡\n` +
           `🔗 *Xem chi tiết:* ${issueUrl}`;
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`GitHub to Google Chat Bridge microservice listening on port ${PORT}`);
});
