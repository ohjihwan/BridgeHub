package com.koreait.apiserver.controller;
import com.koreait.apiserver.dto.ApiResponse;
import com.koreait.apiserver.dto.LoginResponseDTO;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.EmailService;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;
    private final EmailService emailService;
    private final JwtService jwtService;

    // 이메일 인증 코드 발송 (회원가입 전)
    @PostMapping("/api/auth/send-verification")
    public ResponseEntity<ApiResponse<String>> sendVerificationEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            
            emailService.sendVerificationEmail(email);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_SEND_ERROR"));
        }
    }

    // 이메일 인증 확인 (회원가입 전)
    @PostMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_REQUIRED"));
            }
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("CODE_REQUIRED"));
            }
            
            boolean verified = emailService.verifyEmail(email, code);
            if (verified) {
                return ResponseEntity.ok(ApiResponse.success());
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_FAILED"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_ERROR"));
        }
    }

    // 회원가입 (이메일 인증 완료 후)
    @PostMapping("/api/auth/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody MemberDTO memberDTO) {
        try {
            // 이메일 인증 상태 확인
            if (!emailService.isEmailVerified(memberDTO.getEmail())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("EMAIL_VERIFICATION_REQUIRED"));
            }
            
            // 이메일 인증이 완료된 경우에만 emailVerified를 true로 설정
            memberDTO.setEmailVerified(true);
            
            memberService.register(memberDTO);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("REGISTRATION_ERROR"));
        }
    }

    // 로그인
    @PostMapping("/api/auth/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(@RequestBody MemberDTO memberDTO) {
        try {
            MemberDTO result = memberService.login(memberDTO.getUsername(), memberDTO.getPassword());
            if (result != null) {
                // 이메일 인증이 완료되지 않은 경우 로그인 거부
                if (!result.getEmailVerified()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.error("EMAIL_VERIFICATION_REQUIRED"));
                }
                
                // JWT 토큰 생성
                String token = jwtService.generateToken(result.getUsername());
                
                // 로그인 응답 DTO 생성
                LoginResponseDTO loginResponse = new LoginResponseDTO();
                loginResponse.setToken(token);
                loginResponse.setUsername(result.getUsername());
                loginResponse.setEmail(result.getEmail());
                loginResponse.setEmailVerified(result.getEmailVerified());
                
                return ResponseEntity.ok(ApiResponse.success(loginResponse));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("LOGIN_FAILED"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("LOGIN_ERROR"));
        }
    }

    // 이메일 인증 상태 확인
    @GetMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailVerification(@RequestParam String email) {
        try {
            boolean isVerified = emailService.isEmailVerified(email);
            return ResponseEntity.ok(ApiResponse.success(isVerified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("VERIFICATION_STATUS_ERROR"));
        }
    }

    // 회원 정보 조회
    @GetMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(@PathVariable String username) {
        try {
            MemberDTO member = memberService.getMemberByUsername(username);
            return ResponseEntity.ok(ApiResponse.success(member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_GET_ERROR"));
        }
    }

    // 회원 정보 수정
    @PutMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<MemberDTO>> updateMember(
            @PathVariable String username,
            @RequestBody MemberDTO memberDTO) {
        try {
            memberDTO.setUsername(username);
            MemberDTO updatedMember = memberService.updateMember(memberDTO);
            return ResponseEntity.ok(ApiResponse.success(updatedMember));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("PROFILE_UPDATE_ERROR"));
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<String>> deleteMember(@PathVariable String username) {
        try {
            memberService.deleteMember(username);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("MEMBER_DELETE_ERROR"));
        }
    }

    // 관리자 권한 체크 (front-server에서 관리자 페이지 전환용)
    @GetMapping("/api/auth/check-admin")
    public ResponseEntity<ApiResponse<Boolean>> checkAdminRole(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            
            return ResponseEntity.ok(ApiResponse.success(false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("ADMIN_CHECK_ERROR"));
        }
    }

    // 관리자 계정 생성 (개발/테스트용 - 실제 운영에서는 제거 권장)
    @PostMapping("/api/auth/create-admin")
    public ResponseEntity<ApiResponse<String>> createAdminAccount(@RequestBody MemberDTO adminMember) {
        try {
            // 관리자 권한으로 설정
            adminMember.setEmailVerified(true); // 관리자는 이메일 인증 생략
            
            memberService.register(adminMember);
            return ResponseEntity.ok(ApiResponse.success());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("ADMIN_CREATE_ERROR"));
        }
    }
}

