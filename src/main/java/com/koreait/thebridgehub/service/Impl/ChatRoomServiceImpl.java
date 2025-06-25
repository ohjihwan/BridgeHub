package com.koreait.thebridgehub.service.Impl;

import com.koreait.thebridgehub.dao.ChatRoomDao;
import com.koreait.thebridgehub.dao.ChatRoomMemberDao;
import com.koreait.thebridgehub.dto.ChatRoomDTO;
import com.koreait.thebridgehub.entity.ChatRoom;
import com.koreait.thebridgehub.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomServiceImpl implements ChatRoomService {

    private final ChatRoomDao chatRoomDao;
    private final ChatRoomMemberDao chatRoomMemberDao;

    @Override
    public List<ChatRoomDTO> getChatRoomList() {
        return chatRoomDao.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ChatRoomDTO getChatRoom(Integer roomId) {
        Optional<ChatRoom> chatRoomOpt = chatRoomDao.findById(roomId);
        if (chatRoomOpt.isPresent()) {
            ChatRoom chatRoom = chatRoomOpt.get();
            return convertToDTO(chatRoom);
        }
        throw new RuntimeException("채팅방을 찾을 수 없습니다.");
    }

    private ChatRoomDTO convertToDTO(ChatRoom chatRoom) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setRoomId(chatRoom.getRoomId());
        dto.setRoomName(chatRoom.getRoomName());
        dto.setCreatedAt(chatRoom.getCreatedAt());
        dto.setMaxMembers(chatRoom.getMaxMembers());
        dto.setIsActive(chatRoom.getIsActive());
        
        // 현재 멤버 수 조회
        try {
            int currentMemberCount = chatRoomMemberDao.countMembersByRoomId(chatRoom.getRoomId());
            dto.setCurrentMemberCount(currentMemberCount);
        } catch (Exception e) {
            log.warn("채팅방 멤버 수 조회 실패: roomId={}", chatRoom.getRoomId(), e);
            dto.setCurrentMemberCount(0);
        }
        
        return dto;
    }
}