package com.koreait.thebridgehub.service;

import com.koreait.thebridgehub.dto.MemberDTO;

import java.util.List;

public interface MemberService {
    void register(MemberDTO member);
    MemberDTO login(String username, String password);
    void logout(String token);
    void verifyEmail(String username);
    boolean isEmailVerified(String username);
    MemberDTO getMemberByUsername(String username);
    MemberDTO updateMember(MemberDTO member);
    void deleteMember(String username);
    
    // 관리자 기능 추가
    List<MemberDTO> getMembersWithPaging(int page, int size);
    int getTotalMembersCount();
    MemberDTO updateMemberStatus(Integer memberId, String status);
}
