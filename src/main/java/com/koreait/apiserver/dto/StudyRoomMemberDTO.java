package com.koreait.apiserver.dto;

import com.koreait.apiserver.entity.StudyRoomMember;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyRoomMemberDTO {
    private Integer id;
    private Integer studyRoomId;
    private Integer memberId;
    private StudyRoomMember.MemberRole role;
    private StudyRoomMember.MemberStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime approvedAt;
    private Integer approvedBy;
    
    // 멤버 정보
    private String memberName;
    private String memberNickname;
    private String memberEmail;
    private String memberProfileImage;
    
    // 스터디룸 정보
    private String studyRoomTitle;
    
    // 승인자 정보
    private String approverName;
} 