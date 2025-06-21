package com.koreait.restadmin.repository;

import com.koreait.restadmin.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // 기본 조회 메서드
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    
    // 상태별 조회
    List<User> findByStatus(User.UserStatus status);
    Page<User> findByStatus(User.UserStatus status, Pageable pageable);
    
    // 역할별 조회
    List<User> findByRole(User.UserRole role);
    Page<User> findByRole(User.UserRole role, Pageable pageable);
    
    // 검색 기능
    @Query("SELECT u FROM User u WHERE " +
           "(:name IS NULL OR u.name LIKE %:name%) AND " +
           "(:email IS NULL OR u.email LIKE %:email%) AND " +
           "(:region IS NULL OR u.region = :region) AND " +
           "(:status IS NULL OR u.status = :status)")
    Page<User> findBySearchCriteria(
            @Param("name") String name,
            @Param("email") String email,
            @Param("region") String region,
            @Param("status") User.UserStatus status,
            Pageable pageable
    );
    
    // 통계 쿼리
    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate")
    long countByCreatedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(@Param("status") User.UserStatus status);
    
    // 최근 가입자 조회
    List<User> findTop10ByOrderByCreatedAtDesc();
    
    // 마지막 로그인 이후 비활성 사용자
    @Query("SELECT u FROM User u WHERE u.lastLoginAt < :lastLoginBefore")
    List<User> findInactiveUsers(@Param("lastLoginBefore") LocalDateTime lastLoginBefore);
}