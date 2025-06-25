package com.koreait.thebridgehub.controller;

import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.MessageDTO;
import com.koreait.thebridgehub.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    // 메시지 저장 (Socket Server에서 호출)
    @PostMapping
    public ResponseEntity<ApiResponse<MessageDTO>> saveMessage(@RequestBody MessageDTO messageDTO) {
        try {
            MessageDTO savedMessage = messageService.saveMessage(messageDTO);
            return ResponseEntity.ok(ApiResponse.success("메시지 저장 성공", savedMessage));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("메시지 저장 실패: " + e.getMessage()));
        }
    }

    // 채팅 히스토리 조회 (페이징 포함)
    @GetMapping("/history/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getChatHistory(
            @PathVariable Integer roomId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String beforeDate) {
        
        try {
            List<MessageDTO> messages = messageService.getChatHistory(roomId, page, size, beforeDate);
            return ResponseEntity.ok(ApiResponse.success("채팅 히스토리 조회 성공", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("채팅 히스토리 조회 실패: " + e.getMessage()));
        }
    }

    // 채팅방별 메시지 목록 조회 (전체)
    @GetMapping("/room/{roomId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessagesByRoomId(@PathVariable Integer roomId) {
        try {
            List<MessageDTO> messages = messageService.getMessagesByRoomId(roomId);
            return ResponseEntity.ok(ApiResponse.success("메시지 목록 조회 성공", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("메시지 목록 조회 실패: " + e.getMessage()));
        }
    }

    // 메시지 상세 조회
    @GetMapping("/{messageId}")
    public ResponseEntity<ApiResponse<MessageDTO>> getMessage(@PathVariable Integer messageId) {
        try {
            MessageDTO message = messageService.getMessage(messageId);
            if (message != null) {
                return ResponseEntity.ok(ApiResponse.success("메시지 조회 성공", message));
            } else {
                return ResponseEntity.ok(ApiResponse.error("메시지를 찾을 수 없습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("메시지 조회 실패: " + e.getMessage()));
        }
    }

    // 메시지 삭제 (논리 삭제)
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<String>> deleteMessage(@PathVariable Integer messageId) {
        try {
            messageService.deleteMessage(messageId);
            return ResponseEntity.ok(ApiResponse.success("메시지 삭제 성공", "메시지가 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("메시지 삭제 실패: " + e.getMessage()));
        }
    }

    // 사용자별 메시지 목록 조회
    @GetMapping("/sender/{senderId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getMessagesBySenderId(@PathVariable Integer senderId) {
        try {
            List<MessageDTO> messages = messageService.getMessagesBySenderId(senderId);
            return ResponseEntity.ok(ApiResponse.success("사용자 메시지 목록 조회 성공", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("사용자 메시지 목록 조회 실패: " + e.getMessage()));
        }
    }

    // 채팅방 메시지 개수 조회
    @GetMapping("/room/{roomId}/count")
    public ResponseEntity<ApiResponse<Integer>> getMessageCountByRoomId(@PathVariable Integer roomId) {
        try {
            int count = messageService.getMessageCountByRoomId(roomId);
            return ResponseEntity.ok(ApiResponse.success("메시지 개수 조회 성공", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("메시지 개수 조회 실패: " + e.getMessage()));
        }
    }

    // 최근 메시지 조회 (스크롤 업 시 사용)
    @GetMapping("/room/{roomId}/recent")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getRecentMessages(
            @PathVariable Integer roomId,
            @RequestParam(defaultValue = "20") int limit) {
        
        try {
            List<MessageDTO> messages = messageService.getRecentMessages(roomId, limit);
            return ResponseEntity.ok(ApiResponse.success("최근 메시지 조회 성공", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("최근 메시지 조회 실패: " + e.getMessage()));
        }
    }
} 