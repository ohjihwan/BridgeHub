package com.koreait.thebridgehub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudyRoomDTO {
    private Integer studyRoomId;
    private Integer roomId;  // ChatRoom과 연결
    private Integer bossId;  // 방장 ID
    private String title;
    private String description;
    private String education;
    private String department;
    private String region;
    private String district;
    private Integer capacity = 10;
    private Integer currentMembers = 1;
    private String time;
    private String thumbnail;
    private Boolean isPublic = true;
    private LocalDateTime createdAt;
    
    // 방장 정보 (JOIN 결과)
    private String bossName;
    private String bossNickname;
    private String bossProfileImage;
} 