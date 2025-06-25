package com.koreait.restadmin.repository;

import com.koreait.restadmin.domain.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdminLogRepository extends JpaRepository<AdminLog, Long> {
    
    // 관리자별 로그 조회
    List<AdminLog> findByAdminId(Long adminId);
    Page<AdminLog> findByAdminId(Long adminId, Pageable pageable);
    
    // 액션별 로그 조회
    List<AdminLog> findByAction(AdminLog.LogAction action);
    Page<AdminLog> findByAction(AdminLog.LogAction action, Pageable pageable);
    
    // 타겟별 로그 조회
    List<AdminLog> findByTargetTypeAndTargetId(String targetType, Long targetId);
    
    // 날짜 범위별 로그 조회
    List<AdminLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    Page<AdminLog> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // 복합 검색
    @Query("SELECT al FROM AdminLog al WHERE " +
           "(:adminId IS NULL OR al.admin.id = :adminId) AND " +
           "(:action IS NULL OR al.action = :action) AND " +
           "(:targetType IS NULL OR al.targetType = :targetType) AND " +
           "(:startDate IS NULL OR al.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR al.createdAt <= :endDate)")
    Page<AdminLog> findBySearchCriteria(
            @Param("adminId") Long adminId,
            @Param("action") AdminLog.LogAction action,
            @Param("targetType") String targetType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );
    
    // 통계 쿼리
    @Query("SELECT COUNT(al) FROM AdminLog al WHERE al.createdAt >= :startDate")
    long countByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(al) FROM AdminLog al WHERE al.action = :action")
    long countByAction(@Param("action") AdminLog.LogAction action);
    
    // 최근 로그 조회
    List<AdminLog> findTop50ByOrderByCreatedAtDesc();
    
    // 특정 관리자의 최근 활동
    @Query("SELECT al FROM AdminLog al WHERE al.admin.id = :adminId ORDER BY al.createdAt DESC")
    List<AdminLog> findRecentActivityByAdmin(@Param("adminId") Long adminId);
    
    // IP 주소별 로그 조회
    List<AdminLog> findByIpAddress(String ipAddress);
}
