package com.koreait.apiserver.service;

import com.koreait.apiserver.dto.MemberDTO;

import java.util.List;

public interface MemberService {
    void register(MemberDTO member);
    MemberDTO login(String username, String password);
    void logout(String token);
    void verifyEmail(String username);
    boolean isEmailVerified(String username);
    MemberDTO getMemberByUsername(String username);
    MemberDTO getMemberById(Long id); // ID 기반 조회 추가
    MemberDTO updateMember(MemberDTO member);
    void deleteMember(String username);
    
    // 비밀번호 재설정 관련 메서드 추가
    boolean resetPassword(String username, String email, String resetCode, String newPassword);
    
    // 관리자 기능 추가
    List<MemberDTO> getMembersWithPaging(int page, int size);
    int getTotalMembersCount();
    MemberDTO updateMemberStatus(Integer memberId, String status);
}
