package com.koreait.restadmin.service;

import com.koreait.restadmin.domain.User;
import com.koreait.restadmin.dto.UserDto;
import com.koreait.restadmin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 사용자 목록 조회
    public Page<UserDto.UserResponse> getUsers(UserDto.UserSearchRequest request) {
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        
        Page<User> users = userRepository.findBySearchCriteria(
                request.getName(),
                request.getEmail(),
                request.getRegion(),
                request.getStatus(),
                pageable
        );
        
        return users.map(UserDto.UserResponse::from);
    }

    // 사용자 상세 조회
    public Optional<UserDto.UserResponse> getUserById(Long id) {
        return userRepository.findById(id)
                .map(UserDto.UserResponse::from);
    }

    // 사용자 생성
    @Transactional
    public UserDto.UserResponse createUser(UserDto.UserCreateRequest request) {
        // 이메일 중복 확인
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 닉네임 중복 확인
        if (userRepository.findByNickname(request.getNickname()).isPresent()) {
            throw new RuntimeException("이미 존재하는 닉네임입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .nickname(request.getNickname())
                .password(passwordEncoder.encode(request.getPassword()))
                .region(request.getRegion())
                .education(request.getEducation())
                .major(request.getMajor())
                .timezone(request.getTimezone())
                .role(request.getRole() != null ? request.getRole() : User.UserRole.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        return UserDto.UserResponse.from(savedUser);
    }

    // 사용자 수정
    @Transactional
    public UserDto.UserResponse updateUser(Long id, UserDto.UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getNickname() != null) {
            // 닉네임 중복 확인 (자신 제외)
            Optional<User> existingUser = userRepository.findByNickname(request.getNickname());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(id)) {
                throw new RuntimeException("이미 존재하는 닉네임입니다.");
            }
            user.setNickname(request.getNickname());
        }
        if (request.getRegion() != null) user.setRegion(request.getRegion());
        if (request.getEducation() != null) user.setEducation(request.getEducation());
        if (request.getMajor() != null) user.setMajor(request.getMajor());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        User updatedUser = userRepository.save(user);
        return UserDto.UserResponse.from(updatedUser);
    }

    // 사용자 삭제
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        user.setStatus(User.UserStatus.DELETED);
        userRepository.save(user);
    }

    // 사용자 상태 변경
    @Transactional
    public UserDto.UserResponse updateUserStatus(Long id, User.UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        user.setStatus(status);
        User updatedUser = userRepository.save(user);
        return UserDto.UserResponse.from(updatedUser);
    }

    // 사용자 통계 조회
    public UserDto.UserStatistics getUserStatistics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime weekStart = now.minusDays(7);

        return UserDto.UserStatistics.builder()
                .totalUsers(userRepository.count())
                .activeUsers(userRepository.countByStatus(User.UserStatus.ACTIVE))
                .inactiveUsers(userRepository.countByStatus(User.UserStatus.INACTIVE))
                .suspendedUsers(userRepository.countByStatus(User.UserStatus.SUSPENDED))
                .newUsersThisMonth(userRepository.countByCreatedAtAfter(monthStart))
                .newUsersThisWeek(userRepository.countByCreatedAtAfter(weekStart))
                .build();
    }

    // 최근 가입자 조회
    public List<UserDto.UserResponse> getRecentUsers() {
        return userRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(UserDto.UserResponse::from)
                .toList();
    }

    // 비활성 사용자 조회
    public List<UserDto.UserResponse> getInactiveUsers() {
        LocalDateTime lastLoginBefore = LocalDateTime.now().minusMonths(3);
        return userRepository.findInactiveUsers(lastLoginBefore)
                .stream()
                .map(UserDto.UserResponse::from)
                .toList();
    }
} 