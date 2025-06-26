package com.koreait.apiserver.controller;

import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.ChatRoomDTO;
import com.koreait.apiserver.dto.ChatRoomMemberDTO;
import com.koreait.apiserver.service.ChatRoomService;
import com.koreait.apiserver.service.ChatRoomMemberService;
import com.koreait.apiserver.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatRoomMemberService chatRoomMemberService;
    private final JwtService jwtService;

    // 채팅방 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChatRoomDTO>>> getChatRoomList() {
        try {
            log.info("채팅방 목록 조회 요청");
            List<ChatRoomDTO> chatRooms = chatRoomService.getChatRoomList();
            return ResponseEntity.ok(ApiResponse.success(chatRooms));
        } catch (Exception e) {
            log.error("채팅방 목록 조회 실패", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_ROOM_LIST_ERROR"));
        }
    }

    // 채팅방 상세 조회
    @GetMapping("/{roomId}")
    public ResponseEntity<ApiResponse<ChatRoomDTO>> getChatRoom(@PathVariable Integer roomId) {
        try {
            log.info("채팅방 상세 조회 요청: roomId={}", roomId);
            ChatRoomDTO chatRoom = chatRoomService.getChatRoom(roomId);
            return ResponseEntity.ok(ApiResponse.success(chatRoom));
        } catch (Exception e) {
            log.error("채팅방 상세 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_ROOM_DETAIL_ERROR"));
        }
    }

    // 채팅방 멤버 조회
    @GetMapping("/{roomId}/members")
    public ResponseEntity<ApiResponse<List<ChatRoomMemberDTO>>> getChatRoomMembers(@PathVariable Integer roomId) {
        try {
            log.info("채팅방 멤버 조회 요청: roomId={}", roomId);
            List<ChatRoomMemberDTO> members = chatRoomMemberService.getChatRoomMembers(roomId);
            return ResponseEntity.ok(ApiResponse.success(members));
        } catch (Exception e) {
            log.error("채팅방 멤버 조회 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_ROOM_MEMBERS_ERROR"));
        }
    }

    // 채팅방 입장
    @PostMapping("/{roomId}/join")
    public ResponseEntity<ApiResponse<Void>> joinChatRoom(
            @PathVariable Integer roomId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("채팅방 입장 요청: roomId={}", roomId);
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            chatRoomMemberService.joinChatRoom(roomId, memberId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("채팅방 입장 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_ROOM_JOIN_ERROR"));
        }
    }

    // 채팅방 퇴장
    @PostMapping("/{roomId}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveChatRoom(
            @PathVariable Integer roomId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            log.info("채팅방 퇴장 요청: roomId={}", roomId);
            String token = authHeader.replace("Bearer ", "");
            Integer memberId = jwtService.extractMemberId(token);
            
            chatRoomMemberService.leaveChatRoom(roomId, memberId);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            log.error("채팅방 퇴장 실패: roomId={}", roomId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("CHAT_ROOM_LEAVE_ERROR"));
        }
    }
}
