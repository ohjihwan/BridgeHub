package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.ChatRoomDTO;
import com.koreait.apiserver.dto.ChatRoomMemberDTO;
import com.koreait.apiserver.service.ChatRoomMemberService;
import com.koreait.apiserver.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chatrooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatRoomMemberService chatRoomMemberService;
    private final RestTemplate restTemplate = new RestTemplate();

    // 채팅방 목록 조회
    @GetMapping
    public ResponseEntity<List<ChatRoomDTO>> getChatRoomList() {
        return ResponseEntity.ok(chatRoomService.getChatRoomList());
    }

    // 채팅방 상세 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> getChatRoom(@PathVariable Integer roomId) {
        return ResponseEntity.ok(chatRoomService.getChatRoom(roomId));
    }

    // 채팅방 생성
    @PostMapping
    public ResponseEntity<ChatRoomDTO> createChatRoom(@RequestBody ChatRoomDTO chatRoomDTO) {
        return ResponseEntity.ok(chatRoomService.createChatRoom(chatRoomDTO));
    }

    // 채팅방 수정
    @PutMapping("/{roomId}")
    public ResponseEntity<ChatRoomDTO> updateChatRoom(
            @PathVariable Integer roomId,
            @RequestBody ChatRoomDTO chatRoomDTO) {
        chatRoomDTO.setRoomId(roomId);
        return ResponseEntity.ok(chatRoomService.updateChatRoom(chatRoomDTO));
    }

    // 채팅방 삭제
    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteChatRoom(@PathVariable Integer roomId) {
        chatRoomService.deleteChatRoom(roomId);
        return ResponseEntity.ok().build();
    }

    // 채팅방 멤버 조회
    @GetMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<List<ChatRoomMemberDTO>>> getChatRoomMembers(@PathVariable Integer roomId) {
        try {
            log.info("채팅방 멤버 조회: roomId={}", roomId);
            List<ChatRoomMemberDTO> members = chatRoomMemberService.getChatRoomMembers(roomId);
            return ResponseEntity.ok(ApiResponse.success(members));
        } catch (Exception e) {
            log.error("채팅방 멤버 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("MEMBERS_GET_ERROR"));
        }
    }

    // 채팅방 멤버 강퇴 (방장만)
    @DeleteMapping("/{roomId}/members/{memberId}")
    public ResponseEntity<ApiResponse<String>> kickMember(
            @PathVariable Integer roomId,
            @PathVariable Integer memberId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("채팅방 멤버 강퇴: roomId={}, memberId={}", roomId, memberId);
            String token = authHeader.replace("Bearer ", "");
            // TODO: JWT에서 bossId 추출 로직 추가 필요
            // Integer bossId = jwtService.extractMemberId(token);
            
            // 1. 강퇴 처리
            log.info("1단계: 강퇴 처리 시작");
            chatRoomMemberService.kickMember(roomId, memberId);
            log.info("1단계: 강퇴 처리 완료");
            
            // 2. 소켓 서버로 강퇴 알림 전송
            try {
                String socketServerUrl = "http://localhost:7500/api/socket/kick-member";
                
                // JSON 형식으로 올바르게 전송
                String requestBody = String.format("{\"roomId\":%d,\"memberId\":%d}", roomId, memberId);
                
                log.info("2단계: 소켓 서버 호출 시작 - URL: {}, Body: {}", socketServerUrl, requestBody);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
                
                ResponseEntity<String> response = restTemplate.postForEntity(socketServerUrl, entity, String.class);
                log.info("2단계: 소켓 서버 호출 완료 - Status: {}, Response: {}", 
                        response.getStatusCode(), response.getBody());
            } catch (Exception e) {
                log.error("2단계: 소켓 서버 알림 전송 실패 - roomId={}, memberId={}, error={}", 
                        roomId, memberId, e.getMessage(), e);
            }
            
            log.info("채팅방 멤버 강퇴 완료: roomId={}, memberId={}", roomId, memberId);
            return ResponseEntity.ok(ApiResponse.success("멤버가 강퇴되었습니다."));
        } catch (Exception e) {
            log.error("채팅방 멤버 강퇴 실패: roomId={}, memberId={}", roomId, memberId, e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("KICK_MEMBER_ERROR"));
        }
    }
}
