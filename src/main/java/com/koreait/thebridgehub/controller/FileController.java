package com.koreait.thebridgehub.controller;

import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.FileDTO;
import com.koreait.thebridgehub.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Autowired
    private FileService fileService;

    // 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("studyRoomId") Integer studyRoomId,
            @RequestParam("uploaderId") Integer uploaderId,
            @RequestParam(value = "fileType", required = false) String fileType) {
        
        try {
            // fileType이 없으면 파일의 contentType에서 추출
            if (fileType == null || fileType.isEmpty()) {
                fileType = file.getContentType();
            }
            
            FileDTO uploadedFile = fileService.uploadFile(file, fileType, studyRoomId, uploaderId);
            return ResponseEntity.ok(ApiResponse.success("파일 업로드 성공", uploadedFile));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("파일 업로드 실패: " + e.getMessage()));
        }
    }

    // 파일 다운로드
    @GetMapping("/download/{fileId}")
    public ResponseEntity<ByteArrayResource> downloadFile(@PathVariable Integer fileId) {
        try {
            FileDTO fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileData = fileService.downloadFile(fileId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + fileInfo.getOriginalFilename() + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(fileData.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 파일 정보 조회
    @GetMapping("/info/{fileId}")
    public ResponseEntity<ApiResponse<FileDTO>> getFileInfo(@PathVariable Integer fileId) {
        FileDTO fileInfo = fileService.getFileInfo(fileId);
        if (fileInfo == null) {
            return ResponseEntity.ok(ApiResponse.error("파일을 찾을 수 없습니다."));
        }
        return ResponseEntity.ok(ApiResponse.success("파일 정보 조회 성공", fileInfo));
    }

    // 메시지별 파일 목록 조회
    @GetMapping("/message/{messageId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByMessageId(@PathVariable Integer messageId) {
        List<FileDTO> files = fileService.getFilesByMessageId(messageId);
        return ResponseEntity.ok(ApiResponse.success("메시지 파일 목록 조회 성공", files));
    }

    // 스터디룸별 파일 목록 조회
    @GetMapping("/studyroom/{studyRoomId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByStudyRoomId(@PathVariable Integer studyRoomId) {
        List<FileDTO> files = fileService.getFilesByStudyRoomId(studyRoomId);
        return ResponseEntity.ok(ApiResponse.success("스터디룸 파일 목록 조회 성공", files));
    }

    // 회원별 파일 목록 조회
    @GetMapping("/member/{memberId}")
    public ResponseEntity<ApiResponse<List<FileDTO>>> getFilesByMemberId(@PathVariable Integer memberId) {
        List<FileDTO> files = fileService.getFilesByMemberId(memberId);
        return ResponseEntity.ok(ApiResponse.success("회원 파일 목록 조회 성공", files));
    }

    // 파일 삭제 (논리적 삭제)
    @DeleteMapping("/{fileId}")
    public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable Integer fileId) {
        boolean deleted = fileService.deleteFile(fileId);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("파일 삭제 성공", "파일이 삭제되었습니다."));
        } else {
            return ResponseEntity.ok(ApiResponse.error("파일 삭제 실패"));
        }
    }

    // 파일 물리적 삭제
    @DeleteMapping("/{fileId}/permanent")
    public ResponseEntity<ApiResponse<String>> deleteFilePermanently(@PathVariable Integer fileId) {
        boolean deleted = fileService.deleteFilePhysically(fileId);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("파일 영구 삭제 성공", "파일이 영구적으로 삭제되었습니다."));
        } else {
            return ResponseEntity.ok(ApiResponse.error("파일 영구 삭제 실패"));
        }
    }

    // 이미지 미리보기 (썸네일)
    @GetMapping("/thumbnail/{fileId}")
    public ResponseEntity<ByteArrayResource> getThumbnail(@PathVariable Integer fileId) {
        try {
            FileDTO fileInfo = fileService.getFileInfo(fileId);
            if (fileInfo == null || !fileService.isImageFile(fileInfo.getOriginalFilename())) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileData = fileService.downloadFile(fileId);
            ByteArrayResource resource = new ByteArrayResource(fileData);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // 또는 적절한 이미지 타입
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // 파일 업로드 상태 확인
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<String>> getFileServiceStatus() {
        return ResponseEntity.ok(ApiResponse.success("파일 서비스 정상", "파일 서비스가 정상적으로 작동 중입니다."));
    }
}

