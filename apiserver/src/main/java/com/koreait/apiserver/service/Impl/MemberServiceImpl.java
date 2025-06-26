package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.MemberDao;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.entity.Member;
import com.koreait.apiserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberDao memberDao;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void register(MemberDTO memberDTO) {
        log.info("회원가입 시작: {}", memberDTO.getUserid());
        
        if (memberDao.existsByUsername(memberDTO.getUsername())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        
        if (memberDao.existsByEmail(memberDTO.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        Member member = new Member();
        member.setUserid(memberDTO.getUserid());
        member.setPhone(memberDTO.getPhone());
        member.setNickname(memberDTO.getNickname());
        member.setName(memberDTO.getName());
        member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        member.setEducation(memberDTO.getEducation());
        member.setDepartment(memberDTO.getDepartment());
        member.setGender(memberDTO.getGender());
        member.setRegion(memberDTO.getRegion());
        member.setDistrict(memberDTO.getDistrict());
        member.setTime(memberDTO.getTime());
        member.setProfileImage(memberDTO.getProfileImage());
        member.setStatus("ACTIVE");
        member.setEmailVerified(memberDTO.getEmailVerified());
        member.setEmailVerificationCode(null);
        member.setEmailVerificationExpiresAt(null);
        member.setCreatedAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());

        log.info("Member 엔티티 설정 완료: {}", member.getUserid());
        
        try {
            int result = memberDao.insertMember(member);
            log.info("회원가입 완료: {}, 결과: {}", member.getUserid(), result);
        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public MemberDTO login(String username, String password) {
        Optional<Member> memberOpt = memberDao.findByUsername(username);
        
        if (memberOpt.isPresent() && passwordEncoder.matches(password, memberOpt.get().getPassword())) {
            Member member = memberOpt.get();
            return convertToDTO(member);
        }
        
        return null;
    }

    @Override
    public void logout(String token) {
        // JWT 토큰은 클라이언트에서 관리하므로 서버에서는 별도 처리 불필요
    }

    @Override
    @Transactional
    public void verifyEmail(String email) {
        Optional<Member> memberOpt = memberDao.findByEmail(email);
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            memberDao.updateEmailVerification(member.getId(), true, null, null);
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

    @Override
    public boolean isEmailVerified(String email) {
        Optional<Member> memberOpt = memberDao.findByEmail(email);
        return memberOpt.map(Member::getEmailVerified).orElse(false);
    }

    @Override
    public MemberDTO getMemberByUsername(String username) {
        Optional<Member> memberOpt = memberDao.findByUsername(username);
        return memberOpt.map(this::convertToDTO).orElse(null);
    }

    @Override
    @Transactional
    public MemberDTO updateMember(MemberDTO memberDTO) {
        Optional<Member> memberOpt = memberDao.findByUsername(memberDTO.getUsername());
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            
            // DTO에서 받은 모든 필드를 Member 엔티티에 설정
            if (memberDTO.getPassword() != null && !memberDTO.getPassword().isEmpty()) {
                member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
            }
            if (memberDTO.getPhone() != null) {
                member.setPhone(memberDTO.getPhone());
            }
            if (memberDTO.getNickname() != null) {
                member.setNickname(memberDTO.getNickname());
            }
            if (memberDTO.getName() != null) {
                member.setName(memberDTO.getName());
            }
            if (memberDTO.getEducation() != null) {
                member.setEducation(memberDTO.getEducation());
            }
            if (memberDTO.getDepartment() != null) {
                member.setDepartment(memberDTO.getDepartment());
            }
            if (memberDTO.getGender() != null) {
                member.setGender(memberDTO.getGender());
            }
            if (memberDTO.getRegion() != null) {
                member.setRegion(memberDTO.getRegion());
            }
            if (memberDTO.getDistrict() != null) {
                member.setDistrict(memberDTO.getDistrict());
            }
            if (memberDTO.getTime() != null) {
                member.setTime(memberDTO.getTime());
            }
            if (memberDTO.getProfileImage() != null) {
                member.setProfileImage(memberDTO.getProfileImage());
            }
            
            member.setUpdatedAt(LocalDateTime.now());
            memberDao.updateMember(member);
            return convertToDTO(member);
        }
        throw new RuntimeException("사용자를 찾을 수 없습니다.");
    }

    @Override
    @Transactional
    public void deleteMember(String username) {
        Optional<Member> memberOpt = memberDao.findByUsername(username);
        if (memberOpt.isPresent()) {
            memberDao.deleteMember(memberOpt.get().getId());
        } else {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
    }

   
    // 관리자 기능 구현
   

    @Override
    public List<MemberDTO> getMembersWithPaging(int page, int size) {
        int offset = page * size;
        return memberDao.findAllWithPaging(offset, size)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalMembersCount() {
        return memberDao.getTotalCount();
    }

    @Override
    @Transactional
    public MemberDTO updateMemberStatus(Integer memberId, String status) {
        try {
            Optional<Member> memberOpt = memberDao.findById(memberId);
            if (!memberOpt.isPresent()) {
                throw new RuntimeException("회원을 찾을 수 없습니다.");
            }

            memberDao.updateMemberStatus(memberId, status);
            Member updatedMember = memberDao.findById(memberId).orElseThrow();
            
            log.info("회원 상태 변경 완료: memberId={}, status={}", memberId, status);
            
            return convertToDTO(updatedMember);
            
        } catch (Exception e) {
            log.error("회원 상태 변경 실패: memberId={}, status={}", memberId, status, e);
            throw new RuntimeException("회원 상태 변경에 실패했습니다.", e);
        }
    }

    private MemberDTO convertToDTO(Member member) {
        MemberDTO dto = new MemberDTO();
        dto.setUsername(member.getUsername());
        dto.setEmail(member.getEmail());
        dto.setPhone(member.getPhone());
        dto.setNickname(member.getNickname());
        dto.setName(member.getName());
        dto.setEducation(member.getEducation());
        dto.setDepartment(member.getDepartment());
        dto.setGender(member.getGender());
        dto.setRegion(member.getRegion());
        dto.setDistrict(member.getDistrict());
        dto.setTime(member.getTime());
        dto.setProfileImage(member.getProfileImage());
        dto.setEmailVerified(member.getEmailVerified());
        dto.setCreatedAt(member.getCreatedAt());
        dto.setUpdatedAt(member.getUpdatedAt());
        return dto;
    }
}
