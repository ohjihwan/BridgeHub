package com.koreait.restadmin.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_logs")
@Data 
@NoArgsConstructor 
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AdminLog {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LogAction action;

    @Column(columnDefinition = "TEXT")
    private String detail;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum LogAction {
        USER_CREATE, USER_UPDATE, USER_DELETE, USER_SUSPEND,
        REPORT_CREATE, REPORT_RESOLVE, REPORT_REJECT,
        LOGIN, LOGOUT, SYSTEM_CONFIG_UPDATE
    }
}
