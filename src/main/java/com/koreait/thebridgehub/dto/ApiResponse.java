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
    private Boolean showMessage;
    private String debugMessage;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, null);
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>("success", null, null, null, LocalDateTime.now(), null, false, null);
    }

    public static <T> ApiResponse<T> successWithDebug(T data, String debugMessage) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, debugMessage);
    }

    public static <T> ApiResponse<T> errorSilent(String debugMessage) {
        return new ApiResponse<>("error", null, null, null, LocalDateTime.now(), null, false, debugMessage);
    }

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, null);
    }

    public static <T> ApiResponse<T> ok() {
        return new ApiResponse<>("success", null, null, null, LocalDateTime.now(), null, false, null);
    }

    public static <T> ApiResponse<T> successWithMessage(String message, T data) {
        return new ApiResponse<>("success", message, data, null, LocalDateTime.now(), null, true, null);
    }

    public static <T> ApiResponse<T> success(String message, T data, Boolean showMessage) {
        return new ApiResponse<>("success", message, data, null, LocalDateTime.now(), null, showMessage, null);
    }

    public static <T> ApiResponse<T> successSilent(T data) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, null);
    }

    public static <T> ApiResponse<T> successSilent(String message, T data) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, message);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("error", message, null, null, LocalDateTime.now(), null, true, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>("error", message, null, errorCode, LocalDateTime.now(), null, true, null);
    }

    public static <T> ApiResponse<T> error(String errorCode, String message, String path) {
        return new ApiResponse<>("error", message, null, errorCode, LocalDateTime.now(), path, true, null);
    }

    public static <T> ApiResponse<T> error(String message, Boolean showMessage) {
        return new ApiResponse<>("error", message, null, null, LocalDateTime.now(), null, showMessage, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", null, data, null, LocalDateTime.now(), null, false, message);
    }
} 