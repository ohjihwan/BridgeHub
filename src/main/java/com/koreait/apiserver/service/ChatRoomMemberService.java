package com.koreait.thebridgehub.service;

import com.koreait.thebridgehub.dto.ChatRoomMemberDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChatRoomMemberService {
    List<ChatRoomMemberDTO> getChatRoomMembers(Integer roomId);
    void joinChatRoom(Integer roomId, Integer memberId);
    void leaveChatRoom(Integer roomId, Integer memberId);
    boolean isMemberOfChatRoom(Integer roomId, Integer memberId);
} 