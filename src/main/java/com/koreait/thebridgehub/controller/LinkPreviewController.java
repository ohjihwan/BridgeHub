package com.koreait.thebridgehub.controller;

import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.LinkPreviewDTO;
import com.koreait.thebridgehub.service.LinkPreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/link-preview")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LinkPreviewController {

    private final LinkPreviewService linkPreviewService;

    /**
     * URL 메타데이터 추출 (링크 미리보기)
     */
    @PostMapping("/extract")
    public ResponseEntity<ApiResponse<LinkPreviewDTO>> extractLinkPreview(@RequestBody String url) {
        try {
            LinkPreviewDTO preview = linkPreviewService.extractLinkPreview(url.trim());
            
            if (preview.isSuccess()) {
                return ResponseEntity.ok(ApiResponse.success("링크 미리보기 추출 성공", preview));
            } else {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("링크 미리보기 추출 실패: " + preview.getError()));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("링크 미리보기 추출 중 오류 발생: " + e.getMessage()));
        }
    }

    /**
     * 텍스트에서 URL 추출
     */
    @PostMapping("/extract-urls")
    public ResponseEntity<ApiResponse<List<String>>> extractUrls(@RequestBody String text) {
        try {
            List<String> urls = linkPreviewService.extractUrls(text);
            return ResponseEntity.ok(ApiResponse.success("URL 추출 성공", urls));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("URL 추출 실패: " + e.getMessage()));
        }
    }

    /**
     * URL 유효성 검사
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<Boolean>> validateUrl(@RequestBody String url) {
        try {
            boolean isValid = linkPreviewService.isValidUrl(url.trim());
            return ResponseEntity.ok(ApiResponse.success("URL 유효성 검사 완료", isValid));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("URL 유효성 검사 실패: " + e.getMessage()));
        }
    }
} 