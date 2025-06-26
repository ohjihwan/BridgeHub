package com.koreait.thebridgehub.service.Impl;

import com.koreait.thebridgehub.dao.MemberDao;
import com.koreait.thebridgehub.dto.MemberDTO;
import com.koreait.thebridgehub.entity.Member;
import com.koreait.thebridgehub.service.MemberService;
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
        
        // 필수 필드 검증
        if (memberDTO.getUserid() == null || memberDTO.getUserid().trim().isEmpty()) {
            throw new RuntimeException("이메일은 필수 입력 항목입니다.");
        }
        if (memberDTO.getPassword() == null || memberDTO.getPassword().trim().isEmpty()) {
            throw new RuntimeException("비밀번호는 필수 입력 항목입니다.");
        }
        if (memberDTO.getName() == null || memberDTO.getName().trim().isEmpty()) {
            throw new RuntimeException("이름은 필수 입력 항목입니다.");
        }
        if (memberDTO.getNickname() == null || memberDTO.getNickname().trim().isEmpty()) {
            throw new RuntimeException("닉네임은 필수 입력 항목입니다.");
        }
        if (memberDTO.getPhone() == null || memberDTO.getPhone().trim().isEmpty()) {
            throw new RuntimeException("전화번호는 필수 입력 항목입니다.");
        }

        if (memberDTO.getGender() == null || memberDTO.getGender().trim().isEmpty()) {
            throw new RuntimeException("성별은 필수 입력 항목입니다.");
        }

        if (memberDao.existsByUsername(memberDTO.getUsername())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        
        if (memberDao.existsByEmail(memberDTO.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        Member member = new Member();
        member.setUserid(memberDTO.getUserid());
        
        // 필수 필드 설정
        member.setName(memberDTO.getName());
        member.setNickname(memberDTO.getNickname());
        member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        
        // 선택 필드 - 기본값 설정
        member.setPhone(memberDTO.getPhone() != null ? memberDTO.getPhone() : "");
        member.setEducation(memberDTO.getEducation() != null ? memberDTO.getEducation() : "미입력");
        member.setDepartment(memberDTO.getDepartment() != null ? memberDTO.getDepartment() : "미입력");
        member.setGender(memberDTO.getGender() != null ? memberDTO.getGender() : "미입력");
        member.setRegion(memberDTO.getRegion() != null ? memberDTO.getRegion() : "미입력");
        member.setDistrict(memberDTO.getDistrict() != null ? memberDTO.getDistrict() : "미입력");
        member.setTime(memberDTO.getTime() != null ? memberDTO.getTime() : "미입력");
        member.setProfileImage(memberDTO.getProfileImage() != null ? memberDTO.getProfileImage() : "");
        
        // 시스템 필드 설정
        member.setStatus("ACTIVE");
        member.setEmailVerified(memberDTO.getEmailVerified() != null ? memberDTO.getEmailVerified() : false);
        member.setCreatedAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());

        log.info("Member 엔티티 설정 완료: {}", member.getUserid());
        log.info("필수 필드: userid={}, name={}, nickname={}", member.getUserid(), member.getName(), member.getNickname());
        log.info("선택 필드 기본값 설정 완료");
        
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
            memberDao.updateEmailVerification(member.getId(), true);
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
        try {
            log.info("회원 정보 수정 시작: username={}", memberDTO.getUsername());
            
            Optional<Member> memberOpt = memberDao.findByUsername(memberDTO.getUsername());
            if (memberOpt.isPresent()) {
                Member member = memberOpt.get();
                log.info("기존 회원 정보 조회 완료: id={}, userid={}", member.getId(), member.getUserid());
                
                // 비밀번호 업데이트 (입력된 경우에만)
                if (memberDTO.getPassword() != null && !memberDTO.getPassword().trim().isEmpty()) {
                    member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
                    log.info("비밀번호 업데이트 완료");
                }
                
                // 선택 필드 업데이트 (입력된 경우에만, 빈 문자열은 허용)
                if (memberDTO.getPhone() != null) {
                    member.setPhone(memberDTO.getPhone());
                    log.info("전화번호 업데이트: {}", memberDTO.getPhone());
                }
                if (memberDTO.getNickname() != null && !memberDTO.getNickname().trim().isEmpty()) {
                    member.setNickname(memberDTO.getNickname());
                    log.info("닉네임 업데이트: {}", memberDTO.getNickname());
                }
                if (memberDTO.getName() != null && !memberDTO.getName().trim().isEmpty()) {
                    member.setName(memberDTO.getName());
                    log.info("이름 업데이트: {}", memberDTO.getName());
                }
                if (memberDTO.getEducation() != null) {
                    member.setEducation(memberDTO.getEducation());
                    log.info("학력 업데이트: {}", memberDTO.getEducation());
                }
                if (memberDTO.getDepartment() != null) {
                    member.setDepartment(memberDTO.getDepartment());
                    log.info("학과 업데이트: {}", memberDTO.getDepartment());
                }
                if (memberDTO.getGender() != null) {
                    member.setGender(memberDTO.getGender());
                    log.info("성별 업데이트: {}", memberDTO.getGender());
                }
                if (memberDTO.getRegion() != null) {
                    member.setRegion(memberDTO.getRegion());
                    log.info("지역 업데이트: {}", memberDTO.getRegion());
                }
                if (memberDTO.getDistrict() != null) {
                    member.setDistrict(memberDTO.getDistrict());
                    log.info("구/군 업데이트: {}", memberDTO.getDistrict());
                }
                if (memberDTO.getTime() != null) {
                    member.setTime(memberDTO.getTime());
                    log.info("시간대 업데이트: {}", memberDTO.getTime());
                }
                if (memberDTO.getProfileImage() != null) {
                    member.setProfileImage(memberDTO.getProfileImage());
                    log.info("프로필 이미지 업데이트: {}", memberDTO.getProfileImage());
                }
                
                member.setUpdatedAt(LocalDateTime.now());
                log.info("Member 엔티티 업데이트 준비 완료");
                
                int updateResult = memberDao.updateMember(member);
                log.info("데이터베이스 업데이트 완료: result={}", updateResult);
                
                MemberDTO result = convertToDTO(member);
                log.info("회원 정보 수정 완료: username={}", result.getUsername());
                return result;
            } else {
                log.error("사용자를 찾을 수 없음: username={}", memberDTO.getUsername());
                throw new RuntimeException("사용자를 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("회원 정보 수정 실패: username={}, error={}", memberDTO.getUsername(), e.getMessage(), e);
            throw new RuntimeException("회원 정보 수정에 실패했습니다: " + e.getMessage(), e);
        }
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
        try {
            log.info("Member 엔티티를 DTO로 변환 시작: id={}, userid={}", member.getId(), member.getUserid());
            
            MemberDTO dto = new MemberDTO();
            dto.setId(member.getId());
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
            
            log.info("Member 엔티티를 DTO로 변환 완료: username={}, id={}", dto.getUsername(), dto.getId());
            return dto;
        } catch (Exception e) {
            log.error("Member 엔티티를 DTO로 변환 실패: id={}, error={}", member.getId(), e.getMessage(), e);
            throw new RuntimeException("DTO 변환에 실패했습니다: " + e.getMessage(), e);
        }
    }
}
