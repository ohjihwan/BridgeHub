package com.koreait.thebridgehub.controller;
import com.koreait.thebridgehub.dto.ApiResponse;
import com.koreait.thebridgehub.dto.LoginResponseDTO;
import com.koreait.thebridgehub.dto.MemberDTO;
import com.koreait.thebridgehub.service.EmailService;
import com.koreait.thebridgehub.service.JwtService;
import com.koreait.thebridgehub.service.MemberService;
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
                return ResponseEntity.badRequest().body(ApiResponse.error("이메일 주소가 필요합니다."));
            }
            
            emailService.sendVerificationEmail(email);
            return ResponseEntity.ok(ApiResponse.success("인증 코드가 발송되었습니다. 이메일을 확인해주세요.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("인증 코드 발송에 실패했습니다: " + e.getMessage()));
        }
    }

    // 이메일 인증 확인 (회원가입 전)
    @PostMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("이메일 주소가 필요합니다."));
            }
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("인증 코드가 필요합니다."));
            }
            
            boolean verified = emailService.verifyEmail(email, code);
            if (verified) {
                return ResponseEntity.ok(ApiResponse.success("이메일 인증이 완료되었습니다. 회원가입을 진행해주세요.", null));
            } else {
                return ResponseEntity.badRequest().body(ApiResponse.error("인증 코드가 올바르지 않거나 만료되었습니다."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("이메일 인증에 실패했습니다: " + e.getMessage()));
        }
    }

    // 회원가입 (이메일 인증 완료 후)
    @PostMapping("/api/auth/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody MemberDTO memberDTO) {
        try {
            // 이메일 인증 상태 확인
            if (!emailService.isEmailVerified(memberDTO.getEmail())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("이메일 인증이 필요합니다."));
            }
            
            // 이메일 인증이 완료된 경우에만 emailVerified를 true로 설정
            memberDTO.setEmailVerified(true);
            
            memberService.register(memberDTO);
            return ResponseEntity.ok(ApiResponse.success("회원가입이 완료되었습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("회원가입에 실패했습니다: " + e.getMessage()));
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
                            .body(ApiResponse.error("이메일 인증이 완료되지 않았습니다. 이메일 인증을 먼저 완료해주세요."));
                }
                
                // JWT 토큰 생성
                String token = jwtService.generateToken(result.getUsername());
                
                // 로그인 응답 DTO 생성
                LoginResponseDTO loginResponse = new LoginResponseDTO();
                loginResponse.setToken(token);
                loginResponse.setUsername(result.getUsername());
                loginResponse.setRole(result.getRole()); // 사용자 권한 정보 추가
                loginResponse.setEmail(result.getEmail());
                loginResponse.setEmailVerified(result.getEmailVerified());
                
                return ResponseEntity.ok(ApiResponse.success("로그인 성공", loginResponse));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("아이디 또는 비밀번호가 올바르지 않습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("로그인에 실패했습니다: " + e.getMessage()));
        }
    }

    // 이메일 인증 상태 확인
    @GetMapping("/api/auth/verify-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailVerification(@RequestParam String email) {
        try {
            boolean isVerified = emailService.isEmailVerified(email);
            return ResponseEntity.ok(ApiResponse.success("이메일 인증 상태 조회 성공", isVerified));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("이메일 인증 상태 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    // 회원 정보 조회
    @GetMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<MemberDTO>> getMember(@PathVariable String username) {
        try {
            MemberDTO member = memberService.getMemberByUsername(username);
            return ResponseEntity.ok(ApiResponse.success("회원 정보 조회 성공", member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("회원 정보 조회에 실패했습니다: " + e.getMessage()));
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
            return ResponseEntity.ok(ApiResponse.success("회원 정보 수정 성공", updatedMember));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("회원 정보 수정에 실패했습니다: " + e.getMessage()));
        }
    }

    // 회원 탈퇴
    @DeleteMapping("/api/members/{username}")
    public ResponseEntity<ApiResponse<String>> deleteMember(@PathVariable String username) {
        try {
            memberService.deleteMember(username);
            return ResponseEntity.ok(ApiResponse.success("회원 탈퇴가 완료되었습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("회원 탈퇴에 실패했습니다: " + e.getMessage()));
        }
    }

    // 관리자 권한 체크 (front-server에서 관리자 페이지 전환용)
    @GetMapping("/api/auth/check-admin")
    public ResponseEntity<ApiResponse<Boolean>> checkAdminRole(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String role = jwtService.extractRole(token);
            boolean isAdmin = "ADMIN".equals(role);
            
            return ResponseEntity.ok(ApiResponse.success(
                isAdmin ? "관리자 권한 확인됨" : "일반 사용자", isAdmin));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("권한 확인에 실패했습니다: " + e.getMessage()));
        }
    }

    // 관리자 계정 생성 (개발/테스트용 - 실제 운영에서는 제거 권장)
    @PostMapping("/api/auth/create-admin")
    public ResponseEntity<ApiResponse<String>> createAdminAccount(@RequestBody MemberDTO adminMember) {
        try {
            // 관리자 권한으로 설정
            adminMember.setRole("ADMIN");
            adminMember.setEmailVerified(true); // 관리자는 이메일 인증 생략
            
            memberService.register(adminMember);
            return ResponseEntity.ok(ApiResponse.success("관리자 계정이 생성되었습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("관리자 계정 생성에 실패했습니다: " + e.getMessage()));
        }
    }
}

