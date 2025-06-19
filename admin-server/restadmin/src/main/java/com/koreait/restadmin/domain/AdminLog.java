package com.koreait.restadmin.domain;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "admin_logs")
@Data @NoArgsConstructor @AllArgsConstructor
public class AdminLog {
    @Id
    private String id;
    private String action;    // 예: "UPDATE_USER", "RESOLVE_REPORT"
    private String detail;    // 변경 내용
    private LocalDateTime timestamp = LocalDateTime.now();
}
