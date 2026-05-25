import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Load credentials from environment variables
const ZALO_ACCESS_TOKEN = process.env.ZALO_ACCESS_TOKEN || 'YOUR_ZALO_OA_ACCESS_TOKEN';
const ZALO_GROUP_ID = process.env.ZALO_GROUP_ID || 'YOUR_ZALO_GROUP_CHAT_ID';

app.post('/webhooks/github', async (req, res) => {
  const eventType = req.headers['x-github-event'];
  const payload = req.body;

  console.log(`Received GitHub Webhook Event: ${eventType}`);

  try {
    let message = null;

    if (eventType === 'project_v2_item') {
      message = parseProjectV2ItemEvent(payload);
    } else if (eventType === 'pull_request') {
      message = parsePullRequestEvent(payload);
    } else if (eventType === 'issues') {
      message = parseIssueEvent(payload);
    }

    if (message) {
      console.log(`Formatted Message for Zalo: \n${message}`);
      await sendToZalo(message);
    }

    return res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('Error processing GitHub webhook:', error.message);
    return res.status(500).send(`Error: ${error.message}`);
  }
});

// Zalo Webhook helper to log user interactions (helpful to capture User IDs)
app.post('/webhooks/zalo', (req, res) => {
  console.log('--- Received Zalo Webhook Payload ---');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('------------------------------------');
  return res.status(200).send({ error: 0, message: 'Success' });
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

    return `🔔 [THÔNG BÁO DỰ ÁN - PBMS]\n` +
           `👤 Lập trình viên: @${developer} vừa chuyển trạng thái công việc:\n` +
           `📋 Task: ${taskTitle}\n` +
           `🔄 Trạng thái: ${fromStatus} ➡️ ${toStatus} ${emoji}\n` +
           `🔗 Xem chi tiết trên GitProject: https://github.com/users/Pen1112003/projects/14`;
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
    return `🚀 [PULL REQUEST MỚI ĐƯỢC TẠO]\n` +
           `👤 Người tạo: @${developer}\n` +
           `📝 Tiêu đề: ${title}\n` +
           `🚦 Trạng thái: Đang chờ kiểm duyệt 🟡\n` +
           `🔗 Xem chi tiết: ${prUrl}`;
  } else if (action === 'closed') {
    const status = pull_request.merged ? 'Đã được MERGE vào main 🟢' : 'Đã bị ĐÓNG (Không merge) 🔴';
    return `🏁 [PULL REQUEST ĐÃ KẾT THÚC]\n` +
           `👤 Người xử lý: @${developer}\n` +
           `📝 Tiêu đề: ${title}\n` +
           `🚦 Kết quả: ${status}\n` +
           `🔗 Xem chi tiết: ${prUrl}`;
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
    return `⚠️ [PHÁT SINH CÔNG VIỆC/YÊU CẦU MỚI]\n` +
           `👤 Người tạo: @${developer}\n` +
           `📋 Nội dung: ${title}\n` +
           `🚦 Trạng thái: Mở mới (Opened) 🔴\n` +
           `🔗 Xem chi tiết: ${issueUrl}`;
  }
  return null;
}

async function sendToZalo(text) {
  if (ZALO_ACCESS_TOKEN === 'YOUR_ZALO_OA_ACCESS_TOKEN' || ZALO_GROUP_ID === 'YOUR_ZALO_GROUP_CHAT_ID') {
    console.warn('Zalo integration is not fully configured. Skipping API request. Message content:');
    console.log(text);
    return;
  }

  try {
    const url = 'https://openapi.zalo.me/v2.0/oa/message';
    const payload = {
      recipient: {
        chat_id: ZALO_GROUP_ID
      },
      message: {
        text: text
      }
    };

    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': ZALO_ACCESS_TOKEN
      }
    });

    if (response.data && response.data.error === 0) {
      console.log('Successfully sent notification to Zalo.');
    } else {
      console.error('Failed to send to Zalo. Response payload:', response.data);
    }
  } catch (error) {
    console.error('Failed to execute Zalo API call:', error.message);
  }
}

app.listen(PORT, () => {
  console.log(`GitHub to Zalo Bridge microservice listening on port ${PORT}`);
});
