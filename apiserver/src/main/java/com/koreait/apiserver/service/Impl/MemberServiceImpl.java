package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dao.MemberDao;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.entity.Member;
import com.koreait.apiserver.service.EmailService;
import com.koreait.apiserver.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.math.BigInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberServiceImpl implements MemberService {

    private final MemberDao memberDao;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    @Transactional
    public void register(MemberDTO memberDTO) {
        log.info("회원가입 시작: {}", memberDTO.getUserid());
        
        // 필수 필드 검증
        if (memberDTO.getUserid() == null || memberDTO.getUserid().trim().isEmpty()) {
            throw new RuntimeException("USERID_REQUIRED");
        }
        if (memberDTO.getName() == null || memberDTO.getName().trim().isEmpty()) {
            throw new RuntimeException("NAME_REQUIRED");
        }
        if (memberDTO.getPassword() == null || memberDTO.getPassword().trim().isEmpty()) {
            throw new RuntimeException("PASSWORD_REQUIRED");
        }
        if (memberDTO.getPhone() == null || memberDTO.getPhone().trim().isEmpty()) {
            throw new RuntimeException("PHONE_REQUIRED");
        }
        if (memberDTO.getGender() == null || memberDTO.getGender().trim().isEmpty()) {
            throw new RuntimeException("GENDER_REQUIRED");
        }
        if (memberDTO.getNickname() == null || memberDTO.getNickname().trim().isEmpty()) {
            throw new RuntimeException("NICKNAME_REQUIRED");
        }
        
        if (memberDao.existsByUsername(memberDTO.getUsername())) {
            throw new RuntimeException("USERNAME_ALREADY_EXISTS");
        }
        
        if (memberDao.existsByEmail(memberDTO.getEmail())) {
            throw new RuntimeException("EMAIL_ALREADY_EXISTS");
        }

        Member member = new Member();
        member.setUserid(memberDTO.getUserid());
        member.setName(memberDTO.getName());
        member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
        member.setPhone(memberDTO.getPhone());
        member.setGender(memberDTO.getGender());
        member.setNickname(memberDTO.getNickname());
        
        // 선택적 필드는 null 체크 후 설정
        if (memberDTO.getEducation() != null && !memberDTO.getEducation().trim().isEmpty()) {
            member.setEducation(memberDTO.getEducation());
        }
        if (memberDTO.getDepartment() != null && !memberDTO.getDepartment().trim().isEmpty()) {
            member.setDepartment(memberDTO.getDepartment());
        }
        if (memberDTO.getRegion() != null && !memberDTO.getRegion().trim().isEmpty()) {
        member.setRegion(memberDTO.getRegion());
        }
        if (memberDTO.getDistrict() != null && !memberDTO.getDistrict().trim().isEmpty()) {
        member.setDistrict(memberDTO.getDistrict());
        }
        if (memberDTO.getTime() != null && !memberDTO.getTime().trim().isEmpty()) {
        member.setTime(memberDTO.getTime());
        }
        if (memberDTO.getProfileImage() != null && !memberDTO.getProfileImage().trim().isEmpty()) {
        member.setProfileImage(memberDTO.getProfileImage());
        }
        if (memberDTO.getDescription() != null && !memberDTO.getDescription().trim().isEmpty()) {
            member.setDescription(memberDTO.getDescription());
        }
        
        member.setStatus("ACTIVE");
        member.setEmailVerified(memberDTO.getEmailVerified());
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
        // username은 실제로는 이메일(userid)이므로 userid로 조회
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
            throw new RuntimeException("USER_NOT_FOUND");
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
    public MemberDTO getMemberById(Long id) {
        Optional<Member> memberOpt = memberDao.findById(id.intValue()); // Long을 Integer로 변환
        return memberOpt.map(this::convertToDTO).orElse(null);
    }

    @Override
    @Transactional
    public MemberDTO updateMember(MemberDTO memberDTO) {
        log.info("회원 정보 수정 시작: {}", memberDTO.getUsername());
        log.info("수정할 데이터: {}", memberDTO);
        
        Optional<Member> memberOpt = memberDao.findByUsername(memberDTO.getUsername());
        if (memberOpt.isPresent()) {
            Member member = memberOpt.get();
            
            // DTO에서 받은 모든 필드를 Member 엔티티에 설정
            if (memberDTO.getPassword() != null && !memberDTO.getPassword().isEmpty()) {
                member.setPassword(passwordEncoder.encode(memberDTO.getPassword()));
                log.info("비밀번호 업데이트");
            }
            if (memberDTO.getPhone() != null) {
                member.setPhone(memberDTO.getPhone());
                log.info("전화번호 업데이트: {}", memberDTO.getPhone());
            }
            if (memberDTO.getNickname() != null) {
                member.setNickname(memberDTO.getNickname());
                log.info("닉네임 업데이트: {}", memberDTO.getNickname());
            }
            if (memberDTO.getName() != null) {
                member.setName(memberDTO.getName());
                log.info("이름 업데이트: {}", memberDTO.getName());
            }
            if (memberDTO.getEducation() != null) {
                member.setEducation(memberDTO.getEducation());
                log.info("학력 업데이트: {}", memberDTO.getEducation());
            }
            if (memberDTO.getDepartment() != null) {
                member.setDepartment(memberDTO.getDepartment());
                log.info("전공 업데이트: {}", memberDTO.getDepartment());
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
            if (memberDTO.getDescription() != null) {
                member.setDescription(memberDTO.getDescription());
                log.info("설명 업데이트: {}", memberDTO.getDescription());
            }
            
            member.setUpdatedAt(LocalDateTime.now());
            
            try {
                memberDao.updateMember(member);
                log.info("회원 정보 수정 완료: {}", memberDTO.getUsername());
                return convertToDTO(member);
            } catch (Exception e) {
                log.error("회원 정보 수정 실패: {}", e.getMessage(), e);
                throw new RuntimeException("MEMBER_UPDATE_ERROR");
            }
        }
        log.error("사용자를 찾을 수 없음: {}", memberDTO.getUsername());
        throw new RuntimeException("USER_NOT_FOUND");
    }

    @Override
    @Transactional
    public void deleteMember(String username) {
        Optional<Member> memberOpt = memberDao.findByUsername(username);
        if (memberOpt.isPresent()) {
            memberDao.deleteMember(memberOpt.get().getId());
        } else {
            throw new RuntimeException("USER_NOT_FOUND");
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
                throw new RuntimeException("MEMBER_NOT_FOUND");
            }

            memberDao.updateMemberStatus(memberId, status);
            Member updatedMember = memberDao.findById(memberId).orElseThrow();
            
            log.info("회원 상태 변경 완료: memberId={}, status={}", memberId, status);
            
            return convertToDTO(updatedMember);
            
        } catch (Exception e) {
            log.error("회원 상태 변경 실패: memberId={}, status={}", memberId, status, e);
            throw new RuntimeException("MEMBER_STATUS_UPDATE_FAILED", e);
        }
    }

    @Override
    @Transactional
    public boolean resetPassword(String username, String email, String resetCode, String newPassword) {
        log.info("비밀번호 재설정 시작: username={}, email={}", username, email);
        
        try {
            // 1. 사용자명과 이메일 일치 검증
            Optional<Member> memberOpt = memberDao.findByUsername(username);
            if (!memberOpt.isPresent()) {
                log.warn("사용자를 찾을 수 없음: username={}", username);
                return false;
            }
            
            Member member = memberOpt.get();
            if (!member.getUserid().equals(email)) {
                log.warn("사용자명과 이메일이 일치하지 않음: username={}, email={}, userEmail={}", 
                         username, email, member.getUserid());
                return false;
            }
            
            // 2. 재설정 코드 검증
            if (!emailService.verifyPasswordResetCode(email, resetCode)) {
                log.warn("비밀번호 재설정 코드 검증 실패: email={}", email);
                return false;
            }
            
            // 3. 새로운 비밀번호로 변경
            member.setPassword(passwordEncoder.encode(newPassword));
            member.setUpdatedAt(LocalDateTime.now());
            
            memberDao.updateMember(member);
            
            log.info("비밀번호 재설정 완료: username={}, email={}", username, email);
            return true;
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 실패: username={}, email={}, error={}", username, email, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional
    public void deleteMember(Integer memberId) {
        try {
            Optional<Member> memberOpt = memberDao.findById(memberId);
            if (!memberOpt.isPresent()) {
                throw new RuntimeException("MEMBER_NOT_FOUND");
            }

            // 연관된 데이터 삭제 (채팅방 멤버, 스터디룸 멤버 등)
            // chatRoomMemberDao.deleteByMemberId(memberId);
            // studyRoomMemberDao.deleteByMemberId(memberId);
            
            // 회원 삭제
            memberDao.deleteMember(memberId);
            
            log.info("회원 삭제 완료: memberId={}", memberId);
            
        } catch (Exception e) {
            log.error("회원 삭제 실패: memberId={}", memberId, e);
            throw new RuntimeException("MEMBER_DELETE_FAILED", e);
        }
    }

    @Override
    public Map<String, Object> getMemberStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 성별 통계
        List<Map<String, Object>> genderList = memberDao.countByGender();
        Map<String, Integer> genderStats = convertListToMap(genderList, "gender");
        stats.put("gender", genderStats);
        
        // 학력 통계
        List<Map<String, Object>> educationList = memberDao.countByEducation();
        Map<String, Integer> educationStats = convertListToMap(educationList, "education");
        stats.put("education", educationStats);
        
        // 활동 시간대 통계
        List<Map<String, Object>> timeList = memberDao.countByTime();
        Map<String, Integer> timeStats = convertListToMap(timeList, "time");
        stats.put("time", timeStats);
        
        // 전공 통계
        List<Map<String, Object>> majorList = memberDao.countByDepartment();
        Map<String, Integer> majorStats = convertListToMap(majorList, "department");
        stats.put("major", majorStats);
        
        return stats;
    }

    @Override
    public Map<String, Object> getActivityStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // 일별 가입자 통계 조회
        List<Map<String, Object>> dailySignupsList = memberDao.getQuarterlySignups();
        log.info("일별 가입자 쿼리 결과: {}", dailySignupsList);
        Map<String, Integer> dailySignups = convertListToMap(dailySignupsList, "quarter");
        log.info("변환된 일별 가입자: {}", dailySignups);
        stats.put("quarterlySignups", dailySignups);
        
        // 일별 방문자 통계 조회 (현재는 가입자와 동일한 데이터 사용)
        List<Map<String, Object>> dailyVisitorsList = memberDao.getQuarterlyVisitors();
        log.info("일별 방문자 쿼리 결과: {}", dailyVisitorsList);
        Map<String, Integer> dailyVisitors = convertListToMap(dailyVisitorsList, "quarter");
        log.info("변환된 일별 방문자: {}", dailyVisitors);
        stats.put("quarterlyVisitors", dailyVisitors);
        
        // 활동 TOP 10 사용자 조회
        List<Map<String, Object>> topActiveUsers = memberDao.getTopActiveUsers();
        log.info("활동 TOP 10 사용자: {}", topActiveUsers);
        stats.put("topActiveUsers", topActiveUsers);
        
        // 인기 채팅방 TOP 10 조회
        List<Map<String, Object>> popularRooms = memberDao.getPopularRooms();
        log.info("인기 채팅방 TOP 10: {}", popularRooms);
        stats.put("popularRooms", popularRooms);
        
        // 기존 호환성을 위해 totalVisitors 유지 (총 회원 수)
        Integer totalVisitors = memberDao.getTotalVisitors();
        log.info("총 방문자(회원) 수: {}", totalVisitors);
        stats.put("totalVisitors", totalVisitors);
        
        // 실시간 접속자 통계 (새로 추가)
        try {
            // 현재 온라인 사용자 수 (최근 30분 내 활동한 사용자)
            Integer currentOnlineUsers = memberDao.getCurrentOnlineUsers();
            stats.put("currentOnlineUsers", currentOnlineUsers != null ? currentOnlineUsers : 0);
            
            // 활성 스터디룸 목록
            List<Map<String, Object>> activeStudyRooms = memberDao.getActiveStudyRooms();
            stats.put("activeStudyRooms", activeStudyRooms);
            
            // 총 등록 회원 수 (활성 상태만)
            Integer totalRegisteredMembers = memberDao.getTotalRegisteredMembers();
            stats.put("totalRegisteredMembers", totalRegisteredMembers != null ? totalRegisteredMembers : 0);
            
            log.info("실시간 통계 - 온라인: {}, 총 회원: {}, 활성 스터디룸: {}", 
                    currentOnlineUsers, totalRegisteredMembers, activeStudyRooms.size());
            
        } catch (Exception e) {
            log.warn("실시간 접속자 통계 조회 실패, 기본값 사용", e);
            stats.put("currentOnlineUsers", 0);
            stats.put("activeStudyRooms", List.of());
            stats.put("totalRegisteredMembers", 0);
        }
        
        log.info("최종 활동 통계: {}", stats);
        return stats;
    }

    /**
     * MyBatis에서 반환된 List<Map>을 Map<String, Integer>로 변환하는 헬퍼 메서드
     */
    private Map<String, Integer> convertListToMap(List<Map<String, Object>> list, String keyColumn) {
        Map<String, Integer> result = new HashMap<>();
        for (Map<String, Object> row : list) {
            String key = (String) row.get(keyColumn);
            Object countObj = row.get("count");
            Integer count = 0;
            
            if (countObj instanceof Long) {
                count = ((Long) countObj).intValue();
            } else if (countObj instanceof Integer) {
                count = (Integer) countObj;
            } else if (countObj instanceof BigInteger) {
                count = ((BigInteger) countObj).intValue();
            }
            
            if (key != null) {
                result.put(key, count);
            }
        }
        return result;
    }

    private MemberDTO convertToDTO(Member member) {
        MemberDTO dto = new MemberDTO();
        dto.setId(member.getId()); // ID 필드 추가 (JWT 토큰에서 사용자 ID 추출에 필요)
        dto.setUsername(member.getUsername()); // userid 반환
        dto.setEmail(member.getEmail()); // userid 반환 (이메일)
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
        dto.setDescription(member.getDescription());
        dto.setEmailVerified(member.getEmailVerified());
        dto.setCreatedAt(member.getCreatedAt());
        dto.setUpdatedAt(member.getUpdatedAt());
        return dto;
    }

    @Override
    public boolean validateUserInfo(String name, String phone, String email) {
        log.info("사용자 정보 검증 시작: name={}, phone={}, email={}", name, phone, email);
        
        try {
            // 이메일로 사용자 조회
            Optional<Member> memberOpt = memberDao.findByUsername(email);
            if (!memberOpt.isPresent()) {
                log.warn("사용자를 찾을 수 없음: email={}", email);
                return false;
            }
            
            Member member = memberOpt.get();
            
            // 이름, 전화번호, 이메일 모두 일치하는지 확인
            boolean nameMatch = member.getName().equals(name);
            boolean phoneMatch = member.getPhone().equals(phone);
            boolean emailMatch = member.getUserid().equals(email);
            
            log.info("검증 결과 - 이름: {}, 전화번호: {}, 이메일: {}", nameMatch, phoneMatch, emailMatch);
            
            return nameMatch && phoneMatch && emailMatch;
            
        } catch (Exception e) {
            log.error("사용자 정보 검증 실패: name={}, phone={}, email={}, error={}", 
                     name, phone, email, e.getMessage(), e);
            return false;
        }
    }
}
