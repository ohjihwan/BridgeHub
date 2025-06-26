package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.ChatRoomDao;
import com.koreait.apiserver.dao.ChatRoomMemberDao;
import com.koreait.apiserver.dto.ChatRoomDTO;
import com.koreait.apiserver.entity.ChatRoom;
import com.koreait.apiserver.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
>>>>>>> a022c23c4391cf6ee6d4b2fd0655a7fc7cc5db78
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatRoomServiceImpl implements ChatRoomService {

    private final ChatRoomDao chatRoomDao;
<<<<<<< HEAD
=======
    private final ChatRoomMemberDao chatRoomMemberDao;
    @Override
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

<<<<<<< HEAD
    @Override
    @Transactional
    public ChatRoomDTO createChatRoom(ChatRoomDTO chatRoomDTO) {
        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomName(chatRoomDTO.getRoomName());
        chatRoom.setMaxMembers(chatRoomDTO.getMaxMembers());
        chatRoom.setIsActive(chatRoomDTO.getIsActive());
        chatRoom.setCreatedAt(LocalDateTime.now());

        chatRoomDao.insertChatRoom(chatRoom);
        return convertToDTO(chatRoom);
    }

    @Override
    @Transactional
    public ChatRoomDTO updateChatRoom(ChatRoomDTO chatRoomDTO) {
        Optional<ChatRoom> chatRoomOpt = chatRoomDao.findById(chatRoomDTO.getRoomId());
        if (chatRoomOpt.isPresent()) {
            ChatRoom chatRoom = chatRoomOpt.get();
            chatRoom.setRoomName(chatRoomDTO.getRoomName());
            chatRoom.setMaxMembers(chatRoomDTO.getMaxMembers());
            chatRoom.setIsActive(chatRoomDTO.getIsActive());
            
            chatRoomDao.updateChatRoom(chatRoom);
            return convertToDTO(chatRoom);
        }
        throw new RuntimeException("채팅방을 찾을 수 없습니다.");
    }

    @Override
    @Transactional
    public void deleteChatRoom(Integer roomId) {
        Optional<ChatRoom> chatRoomOpt = chatRoomDao.findById(roomId);
        if (chatRoomOpt.isPresent()) {
            chatRoomDao.deleteChatRoom(roomId);
        } else {
            throw new RuntimeException("채팅방을 찾을 수 없습니다.");
        }
    }

=======
>>>>>>> a022c23c4391cf6ee6d4b2fd0655a7fc7cc5db78
    private ChatRoomDTO convertToDTO(ChatRoom chatRoom) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setRoomId(chatRoom.getRoomId());
        dto.setRoomName(chatRoom.getRoomName());
        dto.setCreatedAt(chatRoom.getCreatedAt());
        dto.setMaxMembers(chatRoom.getMaxMembers());
        dto.setIsActive(chatRoom.getIsActive());
<<<<<<< HEAD
=======
        
        // 현재 멤버 수 조회
        try {
            int currentMemberCount = chatRoomMemberDao.countMembersByRoomId(chatRoom.getRoomId());
            dto.setCurrentMemberCount(currentMemberCount);
        } catch (Exception e) {
            log.warn("채팅방 멤버 수 조회 실패: roomId={}", chatRoom.getRoomId(), e);
            dto.setCurrentMemberCount(0);
        }
        
>>>>>>> a022c23c4391cf6ee6d4b2fd0655a7fc7cc5db78
        return dto;
    }
}