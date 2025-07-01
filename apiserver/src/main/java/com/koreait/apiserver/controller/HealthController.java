package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.service.MongoMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class HealthController {

    private final MongoMessageService mongoMessageService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("timestamp", LocalDateTime.now());
        healthData.put("service", "TheBridgeHub API Server");
        healthData.put("version", "1.0.0");
        healthData.put("port", 7100);
        
        return ResponseEntity.ok(ApiResponse.success(healthData));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> simpleHealthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/mongo")
    public ResponseEntity<ApiResponse<String>> checkMongoConnection() {
        try {
            log.info("MongoDB 연결 상태 확인 시작");
            
            // 간단한 메시지 개수 조회로 연결 테스트
            boolean isConnected = mongoMessageService.existsMessageById("test");
            log.info("MongoDB 연결 상태: {}", isConnected ? "성공" : "실패");
            
            return ResponseEntity.ok(ApiResponse.success("MongoDB 연결 성공"));
        } catch (Exception e) {
            log.error("MongoDB 연결 실패", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("MongoDB 연결 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/mongo/messages")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMongoMessages() {
        try {
            log.info("MongoDB 메시지 조회 시작");
            
            // 최근 메시지 5개 조회 (테스트용)
            List<Map<String, Object>> recentMessages = mongoMessageService.getRecentMessages(5);
            
            Map<String, Object> result = new HashMap<>();
            result.put("messageCount", recentMessages.size());
            result.put("recentMessages", recentMessages);
            
            log.info("MongoDB 메시지 조회 완료: {}개", recentMessages.size());
            
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("MongoDB 메시지 조회 실패", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("MongoDB 메시지 조회 실패: " + e.getMessage()));
        }
    }
} 