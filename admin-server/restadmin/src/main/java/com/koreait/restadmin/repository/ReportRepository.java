package com.koreait.restadmin.repository;

import com.koreait.restadmin.domain.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    
    // 상태별 조회
    List<Report> findByStatus(Report.ReportStatus status);
    Page<Report> findByStatus(Report.ReportStatus status, Pageable pageable);
    
    // 신고자별 조회
    List<Report> findByReporterId(Long reporterId);
    Page<Report> findByReporterId(Long reporterId, Pageable pageable);
    
    // 피신고자별 조회
    List<Report> findByTargetId(Long targetId);
    Page<Report> findByTargetId(Long targetId, Pageable pageable);
    
    // 신고 유형별 조회
    List<Report> findByReportType(Report.ReportType reportType);
    Page<Report> findByReportType(Report.ReportType reportType, Pageable pageable);
    
    // 신고 사유별 조회
    List<Report> findByReason(Report.ReportReason reason);
    Page<Report> findByReason(Report.ReportReason reason, Pageable pageable);
    
    // 복합 검색
    @Query("SELECT r FROM Report r WHERE " +
           "(:reporterId IS NULL OR r.reporter.id = :reporterId) AND " +
           "(:targetId IS NULL OR r.target.id = :targetId) AND " +
           "(:reportType IS NULL OR r.reportType = :reportType) AND " +
           "(:reason IS NULL OR r.reason = :reason) AND " +
           "(:status IS NULL OR r.status = :status)")
    Page<Report> findBySearchCriteria(
            @Param("reporterId") Long reporterId,
            @Param("targetId") Long targetId,
            @Param("reportType") Report.ReportType reportType,
            @Param("reason") Report.ReportReason reason,
            @Param("status") Report.ReportStatus status,
            Pageable pageable
    );
    
    // 통계 쿼리
    @Query("SELECT COUNT(r) FROM Report r WHERE r.createdAt >= :startDate")
    long countByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.status = :status")
    long countByStatus(@Param("status") Report.ReportStatus status);
    
    @Query("SELECT COUNT(r) FROM Report r WHERE r.reason = :reason")
    long countByReason(@Param("reason") Report.ReportReason reason);
    
    // 최근 신고 조회
    List<Report> findTop10ByOrderByCreatedAtDesc();
    
    // 처리되지 않은 신고 조회
    @Query("SELECT r FROM Report r WHERE r.status = 'PENDING' ORDER BY r.createdAt ASC")
    List<Report> findPendingReports();
    
    // 특정 기간 내 신고 조회
    @Query("SELECT r FROM Report r WHERE r.createdAt BETWEEN :startDate AND :endDate")
    List<Report> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
} 