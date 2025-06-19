package com.koreait.restadmin.repository;

import com.koreait.restadmin.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> { }