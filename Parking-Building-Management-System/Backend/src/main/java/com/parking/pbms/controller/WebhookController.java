package com.parking.pbms.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/webhooks")
@Slf4j
@SuppressWarnings("unchecked")
public class WebhookController {

    @Value("${zalo.oa.access-token:YOUR_ZALO_OA_ACCESS_TOKEN}")
    private String zaloAccessToken;

    @Value("${zalo.group.id:YOUR_ZALO_GROUP_CHAT_ID}")
    private String zaloGroupId;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/github")
    public ResponseEntity<String> handleGitHubWebhook(
            @RequestHeader(value = "X-GitHub-Event", required = false) String eventType,
            @RequestBody Map<String, Object> payload) {
        
        log.info("Received GitHub Webhook Event: {}", eventType);
        
        try {
            String message = null;

            if ("project_v2_item".equals(eventType)) {
                message = parseProjectV2ItemEvent(payload);
            } else if ("pull_request".equals(eventType)) {
                message = parsePullRequestEvent(payload);
            } else if ("issues".equals(eventType)) {
                message = parseIssueEvent(payload);
            }

            if (message != null) {
                log.info("Formatted Message for Zalo: \n{}", message);
                sendToZalo(message);
            }

            return ResponseEntity.ok("Webhook processed successfully");
        } catch (Exception e) {
            log.error("Error processing GitHub webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing webhook: " + e.getMessage());
        }
    }

    private String parseProjectV2ItemEvent(Map<String, Object> payload) {
        String action = (String) payload.get("action");
        if (!"edited".equals(action)) return null;

        Map<String, Object> sender = (Map<String, Object>) payload.get("sender");
        String developer = sender != null ? (String) sender.get("login") : "Lập trình viên";

        Map<String, Object> item = (Map<String, Object>) payload.get("project_v2_item");
        if (item == null) return null;

        // Extract issue title (content)
        String taskTitle = "Công việc mới";
        if (item.containsKey("content_title")) {
            taskTitle = (String) item.get("content_title");
        }

        // Parse status changes
        Map<String, Object> changes = (Map<String, Object>) payload.get("changes");
        if (changes == null || !changes.containsKey("field_value")) return null;

        Map<String, Object> fieldValue = (Map<String, Object>) changes.get("field_value");
        String fieldName = (String) fieldValue.get("field_name");
        
        if ("Status".equals(fieldName)) {
            String fromStatus = (String) fieldValue.get("from");
            String toStatus = (String) fieldValue.get("to");

            if (fromStatus == null) fromStatus = "Chưa có";
            if (toStatus == null) toStatus = "In Progress";

            // Map standard statuses to pretty emojis
            String emoji = "🔵";
            if ("In Progress".equalsIgnoreCase(toStatus)) emoji = "🔴";
            else if ("Ready To Review".equalsIgnoreCase(toStatus)) emoji = "🟡";
            else if ("Done".equalsIgnoreCase(toStatus)) emoji = "🟢";

            return String.format(
                "🔔 [THÔNG BÁO DỰ ÁN - PBMS]\n" +
                "👤 Lập trình viên: @%s vừa chuyển trạng thái công việc:\n" +
                "📋 Task: %s\n" +
                "🔄 Trạng thái: %s ➡️ %s %s\n" +
                "🔗 Xem chi tiết trên GitProject: https://github.com/users/Pen1112003/projects/14",
                developer, taskTitle, fromStatus, toStatus, emoji
            );
        }

        return null;
    }

    private String parsePullRequestEvent(Map<String, Object> payload) {
        String action = (String) payload.get("action");
        Map<String, Object> pr = (Map<String, Object>) payload.get("pull_request");
        if (pr == null) return null;

        String title = (String) pr.get("title");
        String prUrl = (String) pr.get("html_url");
        Map<String, Object> sender = (Map<String, Object>) payload.get("sender");
        String developer = sender != null ? (String) sender.get("login") : "Lập trình viên";

        if ("opened".equals(action)) {
            return String.format(
                "🚀 [PULL REQUEST MỚI ĐƯỢC TẠO]\n" +
                "👤 Người tạo: @%s\n" +
                "📝 Tiêu đề: %s\n" +
                "🚦 Trạng thái: Đang chờ kiểm duyệt 🟡\n" +
                "🔗 Xem chi tiết: %s",
                developer, title, prUrl
            );
        } else if ("closed".equals(action)) {
            Boolean merged = (Boolean) pr.get("merged");
            String status = merged != null && merged ? "Đã được MERGE vào main 🟢" : "Đã bị ĐÓNG (Không merge) 🔴";
            return String.format(
                "🏁 [PULL REQUEST ĐÃ KẾT THÚC]\n" +
                "👤 Người xử lý: @%s\n" +
                "📝 Tiêu đề: %s\n" +
                "🚦 Kết quả: %s\n" +
                "🔗 Xem chi tiết: %s",
                developer, title, status, prUrl
            );
        }
        return null;
    }

    private String parseIssueEvent(Map<String, Object> payload) {
        String action = (String) payload.get("action");
        Map<String, Object> issue = (Map<String, Object>) payload.get("issue");
        if (issue == null) return null;

        String title = (String) issue.get("title");
        String issueUrl = (String) issue.get("html_url");
        Map<String, Object> sender = (Map<String, Object>) payload.get("sender");
        String developer = sender != null ? (String) sender.get("login") : "Lập trình viên";

        if ("opened".equals(action)) {
            return String.format(
                "⚠️ [PHÁT SINH CÔNG VIỆC/YÊU CẦU MỚI]\n" +
                "👤 Người tạo: @%s\n" +
                "📋 Nội dung: %s\n" +
                "🚦 Trạng thái: Mở mới (Opened) 🔴\n" +
                "🔗 Xem chi tiết: %s",
                developer, title, issueUrl
            );
        }
        return null;
    }

    private void sendToZalo(String text) {
        // Safe check for missing credentials to prevent crash in local environment
        if ("YOUR_ZALO_OA_ACCESS_TOKEN".equals(zaloAccessToken) || "YOUR_ZALO_GROUP_CHAT_ID".equals(zaloGroupId)) {
            log.warn("Zalo integration is not fully configured. Skipping API request. Message content: \n{}", text);
            return;
        }

        try {
            String url = "https://openapi.zalo.me/v2.0/oa/message";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("access_token", zaloAccessToken);

            // Zalo OA API Payload body to send to group or user
            Map<String, Object> body = new HashMap<>();
            
            // Map parameters targeting a specific group chat or user follow
            Map<String, Object> recipient = new HashMap<>();
            recipient.put("chat_id", zaloGroupId); // or user_id
            body.put("recipient", recipient);

            Map<String, Object> message = new HashMap<>();
            message.put("text", text);
            body.put("message", message);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("Successfully sent notification to Zalo. Response: {}", response.getBody());
            } else {
                log.error("Failed to send to Zalo. Status: {}, Response: {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("Failed to execute Zalo API call", e);
        }
    }
}
