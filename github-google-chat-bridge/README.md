# GitHub to Zalo Webhook Bridge

This is a standalone, lightweight Node.js microservice that acts as a webhook forwarding bridge. It receives events from your GitHub repository or Project Board, formats them into beautiful Vietnamese notifications with emojis, and posts them to your team's Zalo Group Chat.

---

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run the Server**:
   ```bash
   # Set environment variables for credentials
   export PORT=3000
   export ZALO_ACCESS_TOKEN="your_access_token_here"
   export ZALO_GROUP_ID="your_zalo_group_chat_id_here"
   
   npm start
   ```

---

## 🌐 How to Deploy to Production

You can deploy this lightweight service easily to any hosting provider (such as Heroku, Render, Vercel, or a custom VPS).

1. Set up the environment variables (`ZALO_ACCESS_TOKEN`, `ZALO_GROUP_ID`, `PORT`) in your hosting provider's dashboard.
2. Deploy the code from this directory.

---

## ⚙️ GitHub Webhook Configuration

1. In your GitHub repository, go to **Settings -> Webhooks -> Add webhook**.
2. Set the **Payload URL** to: `https://your-deployed-service.com/webhooks/github`.
3. Set the **Content type** to: `application/json`.
4. Choose **Let me select individual events** and select:
   - **Issues**
   - **Pull requests**
   - **Project v2 items**
5. Save the webhook.

---

## 💬 Message Template Examples

### 1. Task Moved on Project Board
```text
🔔 [THÔNG BÁO DỰ ÁN - PBMS]
👤 Lập trình viên: @Pen1112003 vừa chuyển trạng thái công việc:
📋 Task: FR-005 Configure pricing and fee policies
🔄 Trạng thái: Todo ➡️ In Progress 🔴
🔗 Xem chi tiết trên GitProject: https://github.com/users/Pen1112003/projects/14
```

### 2. Pull Request Created
```text
🚀 [PULL REQUEST MỚI ĐƯỢC TẠO]
👤 Người tạo: @Pen1112003
📝 Tiêu đề: DEV FR-000: Bootstrap codebase structures
🚦 Trạng thái: Đang chờ kiểm duyệt 🟡
🔗 Xem chi tiết: https://github.com/Pen1112003/DEMO_PROJECT/pull/276
```
