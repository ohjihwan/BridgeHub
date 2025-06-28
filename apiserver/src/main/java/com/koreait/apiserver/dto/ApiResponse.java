package com.koreait.apiserver.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private T data;
    private String errorCode;

    // 성공 응답 - 데이터만
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>("success", data, null);
    }

    // 성공 응답 - 데이터 없음
    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>("success", null, null);
    }

    // 에러 응답 - 에러 코드만
    public static <T> ApiResponse<T> error(String errorCode) {
        return new ApiResponse<>("error", null, errorCode);
    }

    // 에러 응답 - 에러 코드와 데이터
    public static <T> ApiResponse<T> error(String errorCode, T data) {
        return new ApiResponse<>("error", data, errorCode);
    }
} 