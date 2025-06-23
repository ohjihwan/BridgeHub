package com.koreait.restadmin.dto;

import com.koreait.restadmin.domain.Report;
import lombok.*;

import java.time.LocalDateTime;

public class ReportDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportResponse {
        private Long id;
        private Long reporterId;
        private String reporterName;
        private String reporterEmail;
        private Long targetId;
        private String targetName;
        private String targetEmail;
        private Report.ReportType reportType;
        private Report.ReportReason reason;
        private String description;
        private String chatRoomName;
        private String messageContent;
        private String reportContent;
        private Report.ReportStatus status;
        private String penaltyType;
        private String penalty;
        private String adminNote;
        private Long processedById;
        private String processedByName;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ReportResponse from(Report report) {
            return ReportResponse.builder()
                    .id(report.getId())
                    .reporterId(report.getReporter().getId())
                    .reporterName(report.getReporter().getName())
                    .reporterEmail(report.getReporter().getEmail())
                    .targetId(report.getTarget().getId())
                    .targetName(report.getTarget().getName())
                    .targetEmail(report.getTarget().getEmail())
                    .reportType(report.getReportType())
                    .reason(report.getReason())
                    .description(report.getDescription())
                    .chatRoomName(report.getChatRoomName())
                    .messageContent(report.getMessageContent())
                    .reportContent(report.getReportContent())
                    .status(report.getStatus())
                    .penaltyType(report.getPenaltyType())
                    .penalty(report.getPenalty())
                    .adminNote(report.getAdminNote())
                    .processedById(report.getProcessedBy() != null ? report.getProcessedBy().getId() : null)
                    .processedByName(report.getProcessedBy() != null ? report.getProcessedBy().getName() : null)
                    .processedAt(report.getProcessedAt())
                    .createdAt(report.getCreatedAt())
                    .updatedAt(report.getUpdatedAt())
                    .build();
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportCreateRequest {
        private Long reporterId;
        private Long targetId;
        private Report.ReportType reportType;
        private Report.ReportReason reason;
        private String description;
        private String chatRoomName;
        private String messageContent;
        private String reportContent;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportUpdateRequest {
        private Report.ReportStatus status;
        private String penaltyType;
        private String penalty;
        private String adminNote;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportSearchRequest {
        private Long reporterId;
        private Long targetId;
        private Report.ReportType reportType;
        private Report.ReportReason reason;
        private Report.ReportStatus status;
        private Integer page = 0;
        private Integer size = 10;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportStatistics {
        private Long totalReports;
        private Long pendingReports;
        private Long resolvedReports;
        private Long rejectedReports;
        private Long reportsThisMonth;
        private Long reportsThisWeek;
    }
} 