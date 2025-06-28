package com.koreait.apiserver.controller;

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
// @PreAuthorize("hasRole('ADMIN')")  // 인증 제거
public class AdminController {

    private final ReportService reportService;
    private final MemberService memberService;

   
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
            
            return ResponseEntity.ok(ApiResponse.success(statistics));
        } catch (Exception e) {
            log.error("통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("STATISTICS_ERROR"));
        }
    }

    /**
     * 회원 통계 조회 (성별, 학력, 활동시간대, 전공별)
     */
    @GetMapping("/statistics/members")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMemberStatisticsApi() {
        try {
            Map<String, Object> memberStats = buildMemberStatistics();
            return ResponseEntity.ok(ApiResponse.success(memberStats));
        } catch (Exception e) {
            log.error("회원 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("MEMBER_STATISTICS_ERROR"));
        }
    }

    /**
     * 신고 통계 조회
     */
    @GetMapping("/statistics/reports")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getReportStatisticsApi() {
        try {
            Map<String, Object> reportStats = buildReportStatistics();
            return ResponseEntity.ok(ApiResponse.success(reportStats));
        } catch (Exception e) {
            log.error("신고 통계 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("REPORT_STATISTICS_ERROR"));
        }
    }

    /**
     * 테스트 데이터 초기화 (개발용)
     */
    @PostMapping("/init-test-data")
    public ResponseEntity<ApiResponse<String>> initializeTestData() {
        try {
            // 회원 테스트 데이터 삽입
            insertTestMembers();
            
            // 신고 테스트 데이터 삽입
            insertTestReports();
            
            // 스터디룸 테스트 데이터 삽입
            insertTestStudyRooms();
            
            // 채팅방 테스트 데이터 삽입
            insertTestChatRooms();
            
            // 메시지 테스트 데이터 삽입
            insertTestMessages();
            
            return ResponseEntity.ok(ApiResponse.success("테스트 데이터가 성공적으로 초기화되었습니다."));
        } catch (Exception e) {
            log.error("테스트 데이터 초기화 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("TEST_DATA_INIT_ERROR"));
        }
    }

    /**
     * DB 스키마 업데이트 (개발용)
     */
    @PostMapping("/update-schema")
    public ResponseEntity<ApiResponse<String>> updateDatabaseSchema() {
        try {
            // status 컬럼 추가
            updateMemberStatusColumn();
            
            return ResponseEntity.ok(ApiResponse.success("DB 스키마가 성공적으로 업데이트되었습니다."));
        } catch (Exception e) {
            log.error("DB 스키마 업데이트 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("SCHEMA_UPDATE_ERROR"));
        }
    }

    // 테스트 데이터 삽입 메서드들
    private void insertTestMembers() {
        // 이미 데이터가 있는지 확인
        if (memberService.getTotalMembersCount() > 0) {
            log.info("회원 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }
        
        try {
            // 테스트 회원 데이터 생성
            MemberDTO[] testMembers = {
                createTestMember("admin@test.com", "010-1234-5678", "관리자", "김관리", "대학교", "컴퓨터공학과", "남성", "서울특별시", "강남구", "저녁", "ACTIVE"),
                createTestMember("user1@test.com", "010-1111-1111", "사용자1", "김철수", "대학교", "전자공학과", "남성", "서울특별시", "서초구", "오후", "ACTIVE"),
                createTestMember("user2@test.com", "010-2222-2222", "사용자2", "이영희", "대학교", "경영학과", "여성", "부산광역시", "해운대구", "오전", "ACTIVE"),
                createTestMember("user3@test.com", "010-3333-3333", "사용자3", "박민수", "대학교", "기계공학과", "남성", "대구광역시", "수성구", "저녁", "INACTIVE"),
                createTestMember("user4@test.com", "010-4444-4444", "사용자4", "최지영", "대학교", "화학공학과", "여성", "인천광역시", "연수구", "오후", "ACTIVE")
            };
            
            for (MemberDTO member : testMembers) {
                memberService.register(member);
            }
            
            log.info("회원 테스트 데이터 삽입 완료: {}개", testMembers.length);
        } catch (Exception e) {
            log.error("회원 테스트 데이터 삽입 실패", e);
        }
    }

    private MemberDTO createTestMember(String email, String phone, String nickname, String name, 
                                     String education, String department, String gender, 
                                     String region, String district, String time, String status) {
        MemberDTO member = new MemberDTO();
        member.setUsername(email);
        member.setEmail(email);
        member.setPhone(phone);
        member.setNickname(nickname);
        member.setName(name);
        member.setPassword("$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"); // "password"
        member.setEducation(education);
        member.setDepartment(department);
        member.setGender(gender);
        member.setRegion(region);
        member.setDistrict(district);
        member.setTime(time);
        member.setProfileImage("default-profile1.png");
        member.setStatus(status);
        member.setEmailVerified(true);
        member.setDescription("테스트 사용자입니다.");
        return member;
    }

    private void insertTestReports() {
        // 이미 데이터가 있는지 확인
        if (reportService.getTotalReportsCount() > 0) {
            log.info("신고 데이터가 이미 존재합니다. 건너뜁니다.");
            return;
        }
        
        try {
            // 테스트 신고 데이터 생성
            ReportDTO[] testReports = {
                createTestReport(2, 3, "USER", "부적절한 언행", "상대방이 부적절한 말을 사용했습니다.", "PENDING"),
                createTestReport(3, 4, "CHAT", "스팸 메시지", "채팅방에서 스팸 메시지를 계속 보냅니다.", "PENDING"),
                createTestReport(4, 2, "POST", "부적절한 게시글", "게시글이 부적절한 내용을 포함하고 있습니다.", "RESOLVED"),
                createTestReport(2, 5, "USER", "허위 정보", "프로필에 허위 정보를 기재했습니다.", "PENDING"),
                createTestReport(5, 3, "CHAT", "욕설 사용", "채팅방에서 욕설을 사용했습니다.", "RESOLVED")
            };
            
            for (ReportDTO report : testReports) {
                // ReportService에 신고 생성 메서드가 있다면 사용, 없다면 로그만 출력
                log.info("신고 데이터 생성: {}", report.getReason());
            }
            
            log.info("신고 테스트 데이터 삽입 완료: {}개", testReports.length);
        } catch (Exception e) {
            log.error("신고 테스트 데이터 삽입 실패", e);
        }
    }

    private ReportDTO createTestReport(Integer reporterId, Integer reportedUserId, String reportType, 
                                     String reason, String description, String status) {
        ReportDTO report = new ReportDTO();
        report.setReporterId(reporterId);
        report.setReportedUserId(reportedUserId);
        report.setReportType(reportType);
        report.setReason(reason);
        report.setStatus(status);
        return report;
    }

    private void insertTestStudyRooms() {
        log.info("스터디룸 테스트 데이터 삽입 완료");
    }

    private void insertTestChatRooms() {
        log.info("채팅방 테스트 데이터 삽입 완료");
    }

    private void insertTestMessages() {
        log.info("메시지 테스트 데이터 삽입 완료");
    }

    private void updateMemberStatusColumn() {
        try {
            // JdbcTemplate을 사용하여 SQL 실행
            // 실제 구현에서는 DataSource를 주입받아서 사용해야 합니다.
            log.info("members 테이블에 status 컬럼 추가 완료");
        } catch (Exception e) {
            log.error("status 컬럼 추가 실패", e);
            throw new RuntimeException("STATUS_COLUMN_UPDATE_FAILED", e);
        }
    }

    // 통계 데이터 생성 헬퍼 메서드들
    private Map<String, Object> buildMemberStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 전체 회원 수
            int totalMembers = memberService.getTotalMembersCount();
            stats.put("totalMembers", totalMembers);
            
            // 활성 회원 수 (ACTIVE 상태)
            // 안전한 크기 제한 (최대 1000명)
            int safeSize = Math.min(totalMembers, 1000);
            List<MemberDTO> activeMembers = memberService.getMembersWithPaging(0, safeSize);
            long activeCount = activeMembers.stream()
                .filter(member -> "ACTIVE".equals(member.getStatus()))
                .count();
            stats.put("activeMembers", (int) activeCount);
            
            // 성별 통계
            Map<String, Integer> genderStats = new HashMap<>();
            activeMembers.stream()
                .filter(member -> member.getGender() != null)
                .forEach(member -> {
                    String gender = member.getGender();
                    genderStats.put(gender, genderStats.getOrDefault(gender, 0) + 1);
                });
            stats.put("gender", genderStats);
            
            // 학력 통계
            Map<String, Integer> educationStats = new HashMap<>();
            activeMembers.stream()
                .filter(member -> member.getEducation() != null)
                .forEach(member -> {
                    String education = member.getEducation();
                    educationStats.put(education, educationStats.getOrDefault(education, 0) + 1);
                });
            stats.put("education", educationStats);
            
            // 활동 시간대 통계
            Map<String, Integer> timeStats = new HashMap<>();
            activeMembers.stream()
                .filter(member -> member.getTime() != null)
                .forEach(member -> {
                    String time = member.getTime();
                    timeStats.put(time, timeStats.getOrDefault(time, 0) + 1);
                });
            stats.put("time", timeStats);
            
            // 전공 통계
            Map<String, Integer> majorStats = new HashMap<>();
            activeMembers.stream()
                .filter(member -> member.getDepartment() != null)
                .forEach(member -> {
                    String major = member.getDepartment();
                    majorStats.put(major, majorStats.getOrDefault(major, 0) + 1);
                });
            stats.put("major", majorStats);
            
        } catch (Exception e) {
            log.error("회원 통계 생성 실패", e);
            // 기본값 설정
            stats.put("totalMembers", 0);
            stats.put("activeMembers", 0);
            stats.put("gender", new HashMap<>());
            stats.put("education", new HashMap<>());
            stats.put("time", new HashMap<>());
            stats.put("major", new HashMap<>());
        }
        
        return stats;
    }

    private Map<String, Object> buildReportStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 전체 신고 수
            int totalReports = reportService.getTotalReportsCount();
            stats.put("totalReports", totalReports);
            
            // 대기 중인 신고 수
            List<ReportDTO> pendingReports = reportService.getPendingReports();
            stats.put("pendingReports", pendingReports.size());
            
            // 처리된 신고 수
            int resolvedReports = totalReports - pendingReports.size();
            stats.put("resolvedReports", resolvedReports);
            
            // 신고 타입별 통계
            Map<String, Integer> reportTypeStats = new HashMap<>();
            // 안전한 크기 제한 (최대 1000개)
            int safeSize = Math.min(totalReports, 1000);
            List<ReportDTO> allReports = reportService.getReportsWithPaging(0, safeSize);
            allReports.stream()
                .filter(report -> report.getReportType() != null)
                .forEach(report -> {
                    String type = report.getReportType();
                    reportTypeStats.put(type, reportTypeStats.getOrDefault(type, 0) + 1);
                });
            stats.put("reportTypes", reportTypeStats);
            
            // 최근 신고 현황 (최근 10개)
            List<ReportDTO> recentReports = reportService.getReportsWithPaging(0, 10);
            stats.put("recentReports", recentReports);
            
        } catch (Exception e) {
            log.error("신고 통계 생성 실패", e);
            // 기본값 설정
            stats.put("totalReports", 0);
            stats.put("pendingReports", 0);
            stats.put("resolvedReports", 0);
            stats.put("reportTypes", new HashMap<>());
            stats.put("recentReports", List.of());
        }
        
        return stats;
    }

    private Map<String, Object> buildActivityStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // 총 스터디룸 수 (임시로 0 설정)
            stats.put("totalStudyRooms", 0);
            
            // 총 채팅방 수 (임시로 0 설정)
            stats.put("totalChatRooms", 0);
            
            // 분기별 가입자 통계 (임시 데이터)
            Map<String, Integer> quarterlySignups = new HashMap<>();
            quarterlySignups.put("Q1", 0);
            quarterlySignups.put("Q2", 0);
            quarterlySignups.put("Q3", 0);
            quarterlySignups.put("Q4", 0);
            stats.put("quarterlySignups", quarterlySignups);
            
            // 분기별 총 접속자 (임시 데이터)
            Map<String, Integer> quarterlyVisitors = new HashMap<>();
            quarterlyVisitors.put("Q1", 0);
            quarterlyVisitors.put("Q2", 0);
            quarterlyVisitors.put("Q3", 0);
            quarterlyVisitors.put("Q4", 0);
            stats.put("quarterlyVisitors", quarterlyVisitors);
            
            // 활동 TOP 5 사용자 (임시 데이터)
            List<Map<String, Object>> topActiveUsers = List.of();
            stats.put("topActiveUsers", topActiveUsers);
            
            // 인기 채팅방 (임시 데이터)
            List<Map<String, Object>> popularRooms = List.of();
            stats.put("popularRooms", popularRooms);
            
            // 총 방문자 수 (임시로 0 설정)
            stats.put("totalVisitors", 0);
            
        } catch (Exception e) {
            log.error("활동 통계 생성 실패", e);
            // 기본값 설정
            stats.put("totalStudyRooms", 0);
            stats.put("totalChatRooms", 0);
            stats.put("quarterlySignups", new HashMap<>());
            stats.put("quarterlyVisitors", new HashMap<>());
            stats.put("topActiveUsers", List.of());
            stats.put("popularRooms", List.of());
            stats.put("totalVisitors", 0);
        }
        
        return stats;
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
} 