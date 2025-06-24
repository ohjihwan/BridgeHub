package com.koreait.thebridgehub.controller;

import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.MemberDTO;
import com.koreait.thebridgehub.dto.ReportDTO;
import com.koreait.thebridgehub.service.MemberService;
import com.koreait.thebridgehub.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")  // 관리자만 접근 가능
public class AdminController {

    private final ReportService reportService;
    private final MemberService memberService;

    // =============================================
    // 신고 관리 API
    // =============================================

    /**
     * 관리자용 신고 목록 조회 (페이징)
     */
    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<ReportDTO> reports = reportService.getReportsWithPaging(page, size);
            int totalElements = reportService.getTotalReportsCount();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", reports);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(ApiResponse.successWithDebug(response, "신고 목록 조회 성공"));
        } catch (Exception e) {
            log.error("관리자 신고 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorSilent("신고 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 신고 처리 (관리자)
     */
    @PostMapping("/reports/{reportId}/resolve")
    public ResponseEntity<ApiResponse<ReportDTO>> resolveReport(
            @PathVariable Integer reportId,
            @RequestBody ResolveReportRequest request) {
        try {
            ReportDTO resolvedReport = reportService.resolveReport(
                reportId, 
                request.getPenaltyType(), 
                request.getPenalty(), 
                request.getAdminNote()
            );
            return ResponseEntity.ok(ApiResponse.successWithMessage("신고가 처리되었습니다.", resolvedReport));
        } catch (Exception e) {
            log.error("신고 처리 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 처리 중 오류가 발생했습니다."));
        }
    }

    // =============================================
    // 회원 관리 API
    // =============================================

    /**
     * 관리자용 회원 목록 조회 (페이징)
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<MemberDTO> members = memberService.getMembersWithPaging(page, size);
            int totalElements = memberService.getTotalMembersCount();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", members);
            response.put("totalElements", totalElements);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(ApiResponse.successWithDebug(response, "회원 목록 조회 성공"));
        } catch (Exception e) {
            log.error("관리자 회원 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorSilent("회원 목록 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 회원 권한 변경
     */
    @PatchMapping("/users/{memberId}")
    public ResponseEntity<ApiResponse<MemberDTO>> updateUserRole(
            @PathVariable Integer memberId,
            @RequestParam String role) {
        try {
            MemberDTO updatedMember = memberService.updateMemberRole(memberId, role);
            return ResponseEntity.ok(ApiResponse.successWithMessage("회원 권한이 변경되었습니다.", updatedMember));
        } catch (Exception e) {
            log.error("회원 권한 변경 실패: memberId={}, role={}", memberId, role, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("권한 변경 중 오류가 발생했습니다."));
        }
    }

    /**
     * 회원 계정 상태 변경 (정지/활성화)
     */
    @PatchMapping("/users/{memberId}/status")
    public ResponseEntity<ApiResponse<MemberDTO>> updateUserStatus(
            @PathVariable Integer memberId,
            @RequestParam String status) {
        try {
            MemberDTO updatedMember = memberService.updateMemberStatus(memberId, status);
            return ResponseEntity.ok(ApiResponse.successWithMessage("회원 상태가 변경되었습니다.", updatedMember));
        } catch (Exception e) {
            log.error("회원 상태 변경 실패: memberId={}, status={}", memberId, status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("상태 변경 중 오류가 발생했습니다."));
        }
    }

    // =============================================
    // 통계 API
    // =============================================

    /**
     * 관리자 대시보드 통계 조회
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // 1. 회원 통계
            Map<String, Object> memberStats = buildMemberStatistics();
            statistics.put("memberStats", memberStats);
            
            // 2. 신고 통계
            Map<String, Object> reportStats = buildReportStatistics();
            statistics.put("reportStats", reportStats);
            
            // 3. 플랫폼 활동 통계
            Map<String, Object> activityStats = buildActivityStatistics();
            statistics.put("activityStats", activityStats);
            
            return ResponseEntity.ok(ApiResponse.successWithDebug(statistics, "통계 조회 성공"));
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorSilent("통계 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 회원 통계 조회 (성별, 학력, 활동시간대, 전공별)
     */
    @GetMapping("/statistics/members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMemberStatisticsApi() {
        try {
            Map<String, Object> memberStats = buildMemberStatistics();
            return ResponseEntity.ok(ApiResponse.successWithDebug(memberStats, "회원 통계 조회 성공"));
        } catch (Exception e) {
            log.error("회원 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorSilent("회원 통계 조회 중 오류가 발생했습니다."));
        }
    }

    /**
     * 신고 통계 조회
     */
    @GetMapping("/statistics/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportStatisticsApi() {
        try {
            Map<String, Object> reportStats = buildReportStatistics();
            return ResponseEntity.ok(ApiResponse.successWithDebug(reportStats, "신고 통계 조회 성공"));
        } catch (Exception e) {
            log.error("신고 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.errorSilent("신고 통계 조회 중 오류가 발생했습니다."));
        }
    }

    // =============================================
    // 통계 데이터 생성 헬퍼 메서드들
    // =============================================

    private Map<String, Object> buildMemberStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 실제 DB에서 통계 데이터 조회
            Map<String, Integer> genderStats = memberService.getGenderStatistics();
            Map<String, Integer> educationStats = memberService.getEducationStatistics();
            Map<String, Integer> timeStats = memberService.getTimeStatistics();
            Map<String, Integer> majorStats = memberService.getMajorStatistics();
            
            stats.put("gender", genderStats);
            stats.put("education", educationStats);
            stats.put("time", timeStats);
            stats.put("major", majorStats);
            
        } catch (Exception e) {
            log.error("회원 통계 조회 실패", e);
            
            // 에러 시 폴백 더미 데이터 (기존 코드 유지)
        Map<String, Integer> genderStats = new HashMap<>();
        genderStats.put("남성", 50);
        genderStats.put("여성", 15);
        stats.put("gender", genderStats);
        
        Map<String, Integer> educationStats = new HashMap<>();
        educationStats.put("고졸", 35);
        educationStats.put("대학교", 50);
        educationStats.put("대학원", 15);
        stats.put("education", educationStats);
        
        Map<String, Integer> timeStats = new HashMap<>();
        timeStats.put("06:00~12:00", 35);
        timeStats.put("12:00~18:00", 50);
        timeStats.put("18:00~24:00", 15);
        stats.put("time", timeStats);
        
        Map<String, Integer> majorStats = new HashMap<>();
        majorStats.put("인문•사회", 50);
        majorStats.put("상경", 15);
        majorStats.put("자연", 35);
        majorStats.put("공학", 10);
        majorStats.put("예체능", 5);
        majorStats.put("의학", 5);
        majorStats.put("법학", 5);
        majorStats.put("융합", 5);
        stats.put("major", majorStats);
        }
        
        return stats;
    }

    private Map<String, Object> buildReportStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 최근 신고 현황
        List<Map<String, Object>> recentReports = List.of(
            Map.of("id", 1, "reporter", "이민우", "target", "오지환", "reason", "욕설", "date", "2024-01-15"),
            Map.of("id", 2, "reporter", "노현지", "target", "이민우", "reason", "스팸", "date", "2024-01-14"),
            Map.of("id", 3, "reporter", "김철수", "target", "박영희", "reason", "부적절", "date", "2024-01-13"),
            Map.of("id", 4, "reporter", "최영희", "target", "정민수", "reason", "괴롭힘", "date", "2024-01-12")
        );
        stats.put("recentReports", recentReports);
        
        // 신고 타입별 통계
        Map<String, Integer> reportTypeStats = new HashMap<>();
        reportTypeStats.put("욕설", 5);
        reportTypeStats.put("스팸", 3);
        reportTypeStats.put("부적절", 2);
        reportTypeStats.put("괴롭힘", 4);
        stats.put("reportTypes", reportTypeStats);
        
        return stats;
    }

    private Map<String, Object> buildActivityStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 분기별 가입자 통계
        Map<String, Integer> quarterlySignups = new HashMap<>();
        quarterlySignups.put("q1", 200);
        quarterlySignups.put("q2", 400);
        quarterlySignups.put("q3", 300);
        quarterlySignups.put("q4", 500);
        stats.put("quarterlySignups", quarterlySignups);
        
        // 분기별 총 접속자
        Map<String, Integer> quarterlyVisitors = new HashMap<>();
        quarterlyVisitors.put("q1", 400);
        quarterlyVisitors.put("q2", 800);
        quarterlyVisitors.put("q3", 600);
        quarterlyVisitors.put("q4", 1000);
        stats.put("quarterlyVisitors", quarterlyVisitors);
        
        // 활동 TOP 5 사용자
        List<Map<String, Object>> topActiveUsers = List.of(
            Map.of("name", "이민우", "activity", 120),
            Map.of("name", "노현지", "activity", 110),
            Map.of("name", "김철수", "activity", 100),
            Map.of("name", "최영희", "activity", 95),
            Map.of("name", "한지민", "activity", 90)
        );
        stats.put("topActiveUsers", topActiveUsers);
        
        // 인기 채팅방
        List<Map<String, Object>> popularRooms = List.of(
            Map.of("name", "프로그래밍 스터디 A", "count", 45),
            Map.of("name", "영어 스터디 B", "count", 38),
            Map.of("name", "취미 공유방", "count", 32),
            Map.of("name", "자유게시판", "count", 28),
            Map.of("name", "정보공유방", "count", 25)
        );
        stats.put("popularRooms", popularRooms);
        
        // 총 방문자 수
        stats.put("totalVisitors", 5000000);
        
        return stats;
    }

    // =============================================
    // 관리 로그 API (향후 구현)
    // =============================================

    /**
     * 관리 로그 조회 (페이징) - 임시 구현
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // TODO: 관리 로그 서비스 구현 후 연결
            Map<String, Object> response = new HashMap<>();
            response.put("content", List.of());
            response.put("totalElements", 0);
            response.put("totalPages", 0);
            response.put("currentPage", page);
            response.put("size", size);
            
            return ResponseEntity.ok(ApiResponse.success("관리 로그 조회 성공", response));
        } catch (Exception e) {
            log.error("관리 로그 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("관리 로그 조회 중 오류가 발생했습니다."));
        }
    }

    // =============================================
    // 내부 클래스 (Request DTO)
    // =============================================

    public static class ResolveReportRequest {
        private String penaltyType;
        private String penalty;
        private String adminNote;

        // 기본 생성자
        public ResolveReportRequest() {}

        // Getters and Setters
        public String getPenaltyType() { return penaltyType; }
        public void setPenaltyType(String penaltyType) { this.penaltyType = penaltyType; }
        
        public String getPenalty() { return penalty; }
        public void setPenalty(String penalty) { this.penalty = penalty; }
        
        public String getAdminNote() { return adminNote; }
        public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    }
} 