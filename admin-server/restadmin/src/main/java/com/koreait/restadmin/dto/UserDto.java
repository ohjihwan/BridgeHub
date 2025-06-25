package com.koreait.restadmin.dto;

import com.koreait.restadmin.domain.User;
import lombok.*;

import java.time.LocalDateTime;

public class UserDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserResponse {
        private Long id;
        private String email;
        private String name;
        private String nickname;
        private String region;
        private String education;
        private String major;
        private String timezone;
        private User.UserRole role;
        private User.UserStatus status;
        private LocalDateTime lastLoginAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static UserResponse from(User user) {
            return UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .region(user.getRegion())
                    .education(user.getEducation())
                    .major(user.getMajor())
                    .timezone(user.getTimezone())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .lastLoginAt(user.getLastLoginAt())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserCreateRequest {
        private String email;
        private String name;
        private String nickname;
        private String password;
        private String region;
        private String education;
        private String major;
        private String timezone;
        private User.UserRole role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserUpdateRequest {
        private String name;
        private String nickname;
        private String region;
        private String education;
        private String major;
        private String timezone;
        private User.UserRole role;
        private User.UserStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSearchRequest {
        private String name;
        private String email;
        private String region;
        private User.UserStatus status;
        private Integer page = 0;
        private Integer size = 10;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStatistics {
        private Long totalUsers;
        private Long activeUsers;
        private Long inactiveUsers;
        private Long suspendedUsers;
        private Long newUsersThisMonth;
        private Long newUsersThisWeek;
    }
} 