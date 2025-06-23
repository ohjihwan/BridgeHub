package com.koreait.thebridgehub.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    private String errorCode;
    private LocalDateTime timestamp;
    private String path;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data, null, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", "요청이 성공적으로 처리되었습니다.", data, null, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null, null, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>("error", message, null, errorCode, LocalDateTime.now(), null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message, String path) {
        return new ApiResponse<>("error", message, null, errorCode, LocalDateTime.now(), path);
    }
} 