package com.koreait.apiserver.controller;

import com.koreait.apiserver.dao.MemberDao;
import com.koreait.apiserver.dao.ReportDao;
import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.dto.ReportDTO;
import com.koreait.apiserver.service.MemberService;
import com.koreait.apiserver.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// @PreAuthorize("hasRole('ADMIN')")  // 임시 비활성화, 필요시 활성화
public class AdminController {

    private final ReportService reportService;
    private final MemberService memberService;
    private final MemberDao memberDao;
    private final ReportDao reportDao;

   
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
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("관리자 신고 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_LIST_ERROR"));
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
            return ResponseEntity.ok(ApiResponse.success(resolvedReport));
        } catch (Exception e) {
            log.error("신고 처리 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_RESOLVE_ERROR"));
        }
    }

    
    // 회원 관리 API
   

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
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("관리자 회원 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_LIST_ERROR"));
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
            return ResponseEntity.ok(ApiResponse.success(updatedMember));
        } catch (Exception e) {
            log.error("회원 상태 변경 실패: memberId={}, status={}", memberId, status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_STATUS_UPDATE_ERROR"));
        }
    }

    /**
     * 회원 삭제 (관리자)
     */
    @DeleteMapping("/users/{memberId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Integer memberId) {
        try {
            memberService.deleteMember(memberId);
            return ResponseEntity.ok(ApiResponse.success("회원이 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            log.error("회원 삭제 실패: memberId={}", memberId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("USER_DELETE_ERROR"));
        }
    }

   

   
    // 관리자 대시보드 통계 조회
    
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // 1. 회원 통계 (안전하게 호출)
            Map<String, Object> memberStats = buildMemberStatistics();
            statistics.put("memberStats", memberStats);
            
            // 2. 신고 통계 (안전하게 호출)
            Map<String, Object> reportStats = buildReportStatistics();
            statistics.put("reportStats", reportStats);
            
            // 3. 플랫폼 활동 통계 (안전하게 호출)
            Map<String, Object> activityStats = buildActivityStatistics();
            statistics.put("activityStats", activityStats);
            
            log.info("통계 조회 성공: memberStats={}, reportStats={}, activityStats={}", 
                    memberStats.size(), reportStats.size(), activityStats.size());
            
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            
            // 500 에러 방지를 위한 기본 데이터 반환
            Map<String, Object> fallbackStats = createFallbackStatistics();
            return ResponseEntity.ok(ApiResponse.success(fallbackStats));
        }
    }

    
     // 회원 통계 조회 (성별, 학력, 활동시간대, 전공별)
     
    @GetMapping("/statistics/members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMemberStatisticsApi() {
        try {
            Map<String, Object> memberStats = buildMemberStatistics();
            return ResponseEntity.ok(ApiResponse.success(memberStats));
        } catch (Exception e) {
            log.error("회원 통계 조회 실패", e);
            Map<String, Object> fallbackMemberStats = createFallbackMemberStatistics();
            return ResponseEntity.ok(ApiResponse.success(fallbackMemberStats));
        }
    }

    
     // 신고 통계 조회
    
    @GetMapping("/statistics/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportStatisticsApi() {
        try {
            Map<String, Object> reportStats = buildReportStatistics();
            return ResponseEntity.ok(ApiResponse.success(reportStats));
        } catch (Exception e) {
            log.error("신고 통계 조회 실패", e);
            Map<String, Object> fallbackReportStats = createFallbackReportStatistics();
            return ResponseEntity.ok(ApiResponse.success(fallbackReportStats));
        }
    }

    @GetMapping("/statistics/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActivityStatisticsApi() {
        try {
            Map<String, Object> activityStats = buildActivityStatistics();
            return ResponseEntity.ok(ApiResponse.success(activityStats));
        } catch (Exception e) {
            log.error("활동 통계 조회 실패", e);
            Map<String, Object> fallbackActivityStats = createFallbackActivityStatistics();
            return ResponseEntity.ok(ApiResponse.success(fallbackActivityStats));
        }
    }

    
    // 통계 데이터 생성 헬퍼 메서드들 (안전하게 수정)
    

    private Map<String, Object> buildMemberStatistics() {
        try {
            Map<String, Object> stats = memberService.getMemberStatistics();
            if (stats == null || stats.isEmpty()) {
                log.warn("회원 통계 데이터가 비어있음, 기본값 반환");
                return createFallbackMemberStatistics();
            }
            return stats;
        } catch (Exception e) {
            log.error("회원 통계 조회 중 오류 발생", e);
            return createFallbackMemberStatistics();
        }
    }

    private Map<String, Object> buildReportStatistics() {
        try {
            Map<String, Object> stats = reportService.getReportStatistics();
            if (stats == null || stats.isEmpty()) {
                log.warn("신고 통계 데이터가 비어있음, 기본값 반환");
                return createFallbackReportStatistics();
            }
            return stats;
        } catch (Exception e) {
            log.error("신고 통계 조회 중 오류 발생", e);
            return createFallbackReportStatistics();
        }
    }

    private Map<String, Object> buildActivityStatistics() {
        try {
            Map<String, Object> stats = memberService.getActivityStatistics();
            if (stats == null || stats.isEmpty()) {
                log.warn("활동 통계 데이터가 비어있음, 기본값 반환");
                return createFallbackActivityStatistics();
            }
            return stats;
        } catch (Exception e) {
            log.error("활동 통계 조회 중 오류 발생", e);
            return createFallbackActivityStatistics();
        }
    }

    // 기본 통계 데이터 생성 메서드들 (새로 추가)
    
    private Map<String, Object> createFallbackStatistics() {
        Map<String, Object> fallbackStats = new HashMap<>();
        fallbackStats.put("memberStats", createFallbackMemberStatistics());
        fallbackStats.put("reportStats", createFallbackReportStatistics());
        fallbackStats.put("activityStats", createFallbackActivityStatistics());
        return fallbackStats;
    }
    
    private Map<String, Object> createFallbackMemberStatistics() {
        Map<String, Object> memberStats = new HashMap<>();
        
        // 성별 기본 데이터
        Map<String, Integer> gender = new HashMap<>();
        gender.put("남성", 0);
        gender.put("여성", 0);
        memberStats.put("gender", gender);
        
        // 학력 기본 데이터
        Map<String, Integer> education = new HashMap<>();
        education.put("고졸", 0);
        education.put("대학교", 0);
        education.put("대학원", 0);
        memberStats.put("education", education);
        
        // 활동 시간대 기본 데이터
        Map<String, Integer> time = new HashMap<>();
        time.put("오전", 0);
        time.put("오후", 0);
        time.put("저녁", 0);
        memberStats.put("time", time);
        
        // 전공 기본 데이터
        Map<String, Integer> major = new HashMap<>();
        major.put("인문•사회", 0);
        major.put("상경", 0);
        major.put("자연", 0);
        major.put("공학", 0);
        major.put("예체능", 0);
        major.put("의학", 0);
        major.put("법학", 0);
        major.put("융합", 0);
        memberStats.put("major", major);
        
        return memberStats;
    }
    
    private Map<String, Object> createFallbackReportStatistics() {
        Map<String, Object> reportStats = new HashMap<>();
        reportStats.put("recentReports", List.of());
        
        Map<String, Integer> reportTypes = new HashMap<>();
        reportTypes.put("욕설", 0);
        reportTypes.put("스팸", 0);
        reportTypes.put("부적절한 내용", 0);
        reportStats.put("reportTypes", reportTypes);
        
        return reportStats;
    }
    
    private Map<String, Object> createFallbackActivityStatistics() {
        Map<String, Object> activityStats = new HashMap<>();
        
        Map<String, Integer> dailySignups = new HashMap<>();
        // 최근 7일 기본 데이터
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            dailySignups.put(date.toString(), 0);
        }
        activityStats.put("quarterlySignups", dailySignups);
        
        Map<String, Integer> dailyVisitors = new HashMap<>();
        // 최근 7일 기본 데이터  
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
            dailyVisitors.put(date.toString(), 0);
        }
        activityStats.put("quarterlyVisitors", dailyVisitors);
        
        activityStats.put("topActiveUsers", List.of());
        activityStats.put("popularRooms", List.of());
        activityStats.put("totalVisitors", 0);
        
        // 실시간 접속자 정보 추가
        activityStats.put("totalRegisteredMembers", 0);
        activityStats.put("activeStudyRooms", List.of());
        
        return activityStats;
    }

    
    // 내부 클래스 (Request DTO)
    

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

    @GetMapping("/debug-studyrooms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugStudyRooms() {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            // 1. 활성 스터디룸 원본 데이터 조회만
            List<Map<String, Object>> activeStudyRooms = memberDao.getActiveStudyRooms();
            debug.put("activeStudyRoomsRaw", activeStudyRooms);
            debug.put("activeStudyRoomsCount", activeStudyRooms.size());
            
            log.info("스터디룸 디버그 정보: {}", debug);
            
            return ResponseEntity.ok(ApiResponse.success("스터디룸 디버그 성공", debug));
            
        } catch (Exception e) {
            log.error("스터디룸 디버그 실패", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("스터디룸 디버그 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/debug-reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugReports() {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            // 1. 간단한 Report 데이터 조회
            List<Map<String, Object>> simpleReports = reportDao.findSimpleReports();
            debug.put("simpleReportsRaw", simpleReports);
            debug.put("simpleReportsCount", simpleReports.size());
            
            // 2. 전체 Report 개수
            int totalCount = reportDao.getTotalCount();
            debug.put("totalReportsCount", totalCount);
            
            log.info("신고 디버그 정보: {}", debug);
            
            return ResponseEntity.ok(ApiResponse.success("신고 디버그 성공", debug));
            
        } catch (Exception e) {
            log.error("신고 디버그 실패", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("신고 디버그 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/debug-members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> debugMembers() {
        try {
            Map<String, Object> debug = new HashMap<>();
            
            // 1. 직접 DAO로 총 회원 수 조회
            int totalCount = memberService.getTotalMembersCount();
            debug.put("totalMembersFromService", totalCount);
            
            // 2. 성별 통계로 간접 계산
            Map<String, Object> memberStats = memberService.getMemberStatistics();
            Map<String, Integer> genderStats = (Map<String, Integer>) memberStats.get("gender");
            int totalFromGender = genderStats != null ? genderStats.values().stream().mapToInt(Integer::intValue).sum() : 0;
            debug.put("totalFromGenderStats", totalFromGender);
            
            // 3. 활동 통계 조회
            Map<String, Object> activityStats = memberService.getActivityStatistics();
            debug.put("activityStats", activityStats);
            
            log.info("디버그 정보: {}", debug);
            
            return ResponseEntity.ok(ApiResponse.success("디버그 성공", debug));
            
        } catch (Exception e) {
            log.error("디버그 실패", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("디버그 실패: " + e.getMessage()));
        }
    }


}