package com.koreait.thebridgehub.controller;

import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.MessageDTO;
import com.koreait.thebridgehub.dto.ReportDTO;
import com.koreait.thebridgehub.service.JwtService;
import com.koreait.thebridgehub.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getReportList() {
        try {
            List<ReportDTO> reports = reportService.getReportList();
            return ResponseEntity.ok(ApiResponse.success("신고 목록 조회 성공", reports));
        } catch (Exception e) {
            log.error("신고 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 목록 조회 중 오류가 발생했습니다.", null));
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<ApiResponse<ReportDTO>> getReport(@PathVariable Integer reportId) {
        try {
            ReportDTO report = reportService.getReport(reportId);
            return ResponseEntity.ok(ApiResponse.success("신고 상세 조회 성공", report));
        } catch (Exception e) {
            log.error("신고 상세 조회 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 상세 조회 중 오류가 발생했습니다.", null));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportDTO>> createReport(
            @RequestBody @Valid ReportDTO reportDTO,
            HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                Integer reporterId = jwtService.extractMemberId(token);
                reportDTO.setReporterId(reporterId);
            }
            
            ReportDTO createdReport = reportService.createReport(reportDTO);
            return ResponseEntity.ok(ApiResponse.success("신고가 접수되었습니다.", createdReport));
        } catch (Exception e) {
            log.error("신고 생성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 처리 중 오류가 발생했습니다.", null));
        }
    }

    @PostMapping("/chat-log")
    public ResponseEntity<ApiResponse<String>> reportFromChatLog(
            @RequestBody @Valid ReportDTO reportDTO,
            HttpServletRequest request) {
        
        try {
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("인증이 필요합니다.", null));
            }
            
            String token = authHeader.substring(7);
            Integer reporterId = jwtService.extractMemberId(token);
            reportDTO.setReporterId(reporterId);
            
            reportService.createReportFromChatLog(reportDTO);
            
            return ResponseEntity.ok(ApiResponse.success("채팅 로그 신고가 접수되었습니다.", null));
            
        } catch (Exception e) {
            log.error("채팅 로그 신고 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 처리 중 오류가 발생했습니다.", null));
        }
    }

    @GetMapping("/chat-evidence/{reportId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getChatEvidence(
            @PathVariable Integer reportId) {
        
        try {
            List<MessageDTO> evidence = reportService.getChatEvidenceFromLog(reportId);
            return ResponseEntity.ok(ApiResponse.success("채팅 증거 조회 성공", evidence));
            
        } catch (Exception e) {
            log.error("채팅 증거 조회 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("채팅 증거 조회 중 오류가 발생했습니다.", null));
        }
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<ApiResponse<ReportDTO>> updateReportStatus(
            @PathVariable Integer reportId,
            @RequestParam String status,
            @RequestParam(required = false) String adminComment) {
        try {
            ReportDTO updatedReport = reportService.updateReportStatus(reportId, status, adminComment);
            return ResponseEntity.ok(ApiResponse.success("신고 상태가 업데이트되었습니다.", updatedReport));
        } catch (Exception e) {
            log.error("신고 상태 업데이트 실패: reportId={}", reportId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고 상태 업데이트 중 오류가 발생했습니다.", null));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getPendingReports() {
        try {
            List<ReportDTO> reports = reportService.getPendingReports();
            return ResponseEntity.ok(ApiResponse.success("대기 중인 신고 조회 성공", reports));
        } catch (Exception e) {
            log.error("대기 중인 신고 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("대기 중인 신고 조회 중 오류가 발생했습니다.", null));
        }
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<ApiResponse<List<ReportDTO>>> getReportsByReporter(@PathVariable Integer reporterId) {
        try {
            List<ReportDTO> reports = reportService.getReportsByReporter(reporterId);
            return ResponseEntity.ok(ApiResponse.success("신고자별 신고 조회 성공", reports));
        } catch (Exception e) {
            log.error("신고자별 신고 조회 실패: reporterId={}", reporterId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("신고자별 신고 조회 중 오류가 발생했습니다.", null));
        }
    }
} 