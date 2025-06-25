package com.koreait.thebridgehub.service;
import com.koreait.thebridgehub.dto.ChatRoomDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChatRoomService {
    List<ChatRoomDTO> getChatRoomList();
    ChatRoomDTO getChatRoom(Integer roomId);
    ChatRoomDTO createChatRoom(ChatRoomDTO chatRoomDTO);
    ChatRoomDTO updateChatRoom(ChatRoomDTO chatRoomDTO);
    void deleteChatRoom(Integer roomId);
}

