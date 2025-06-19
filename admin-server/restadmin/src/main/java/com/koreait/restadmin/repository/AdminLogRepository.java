package com.koreait.restadmin.repository;

import com.koreait.restadmin.domain.AdminLog;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminLogRepository extends MongoRepository<AdminLog, String> { }
