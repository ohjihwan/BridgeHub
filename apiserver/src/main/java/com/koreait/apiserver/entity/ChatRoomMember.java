package com.koreait.apiserver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMember {
    
    private Integer roomId;  // ChatRoom과 연결
    private Integer memberId;  // Member와 연결
    private LocalDateTime joinedAt;
    private Boolean isAdmin = false;
    
    // 조인된 멤버 정보
    private String memberName;
    private String memberNickname;
    private String memberProfileImage;
} 