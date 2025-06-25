package com.koreait.restadmin.service;

import com.koreait.restadmin.domain.Report;
import com.koreait.restadmin.domain.User;
import com.koreait.restadmin.dto.ReportDto;
import com.koreait.restadmin.repository.ReportRepository;
import com.koreait.restadmin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    // 신고 목록 조회
    public Page<ReportDto.ReportResponse> getReports(ReportDto.ReportSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        Page<Report> reports = reportRepository.findBySearchCriteria(
                request.getReporterId(),
                request.getTargetId(),
                request.getReportType(),
                request.getReason(),
                request.getStatus(),
                pageable
        );
        
        return reports.map(ReportDto.ReportResponse::from);
    }

    // 신고 상세 조회
    public Optional<ReportDto.ReportResponse> getReportById(Long id) {
        return reportRepository.findById(id)
                .map(ReportDto.ReportResponse::from);
    }

    // 신고 생성
    @Transactional
    public ReportDto.ReportResponse createReport(ReportDto.ReportCreateRequest request) {
        User reporter = userRepository.findById(request.getReporterId())
                .orElseThrow(() -> new RuntimeException("신고자를 찾을 수 없습니다."));
        
        User target = userRepository.findById(request.getTargetId())
                .orElseThrow(() -> new RuntimeException("피신고자를 찾을 수 없습니다."));

        Report report = Report.builder()
                .reporter(reporter)
                .target(target)
                .reportType(request.getReportType())
                .reason(request.getReason())
                .description(request.getDescription())
                .chatRoomName(request.getChatRoomName())
                .messageContent(request.getMessageContent())
                .reportContent(request.getReportContent())
                .status(Report.ReportStatus.PENDING)
                .build();

        Report savedReport = reportRepository.save(report);
        return ReportDto.ReportResponse.from(savedReport);
    }

    // 신고 처리
    @Transactional
    public ReportDto.ReportResponse processReport(Long id, ReportDto.ReportUpdateRequest request, Long adminId) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("신고를 찾을 수 없습니다."));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다."));

        report.setStatus(request.getStatus());
        report.setPenaltyType(request.getPenaltyType());
        report.setPenalty(request.getPenalty());
        report.setAdminNote(request.getAdminNote());
        report.setProcessedBy(admin);
        report.setProcessedAt(LocalDateTime.now());

        Report updatedReport = reportRepository.save(report);
        return ReportDto.ReportResponse.from(updatedReport);
    }

    // 신고 삭제
    @Transactional
    public void deleteReport(Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("신고를 찾을 수 없습니다."));
        
        reportRepository.delete(report);
    }

    // 대기중인 신고 조회
    public List<ReportDto.ReportResponse> getPendingReports() {
        return reportRepository.findPendingReports()
                .stream()
                .map(ReportDto.ReportResponse::from)
                .toList();
    }

    // 신고 통계 조회
    public ReportDto.ReportStatistics getReportStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = now.minusDays(7);

        return ReportDto.ReportStatistics.builder()
                .totalReports(reportRepository.count())
                .pendingReports(reportRepository.countByStatus(Report.ReportStatus.PENDING))
                .resolvedReports(reportRepository.countByStatus(Report.ReportStatus.RESOLVED))
                .rejectedReports(reportRepository.countByStatus(Report.ReportStatus.REJECTED))
                .reportsThisMonth(reportRepository.countByCreatedAtAfter(monthStart))
                .reportsThisWeek(reportRepository.countByCreatedAtAfter(weekStart))
                .build();
    }

    // 최근 신고 조회
    public List<ReportDto.ReportResponse> getRecentReports() {
        return reportRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(ReportDto.ReportResponse::from)
                .toList();
    }

    // 특정 기간 내 신고 조회
    public List<ReportDto.ReportResponse> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return reportRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(ReportDto.ReportResponse::from)
                .toList();
    }

    // 사용자별 신고 조회
    public List<ReportDto.ReportResponse> getReportsByReporter(Long reporterId) {
        return reportRepository.findByReporterId(reporterId)
                .stream()
                .map(ReportDto.ReportResponse::from)
                .toList();
    }

    public List<ReportDto.ReportResponse> getReportsByTarget(Long targetId) {
        return reportRepository.findByTargetId(targetId)
                .stream()
                .map(ReportDto.ReportResponse::from)
                .toList();
    }
} 