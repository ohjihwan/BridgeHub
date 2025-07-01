package com.koreait.apiserver.service;

import com.koreait.apiserver.entity.MongoMessage;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface MongoMessageService {
    
    /**
     * 메시지 ID로 메시지 조회
     */
    Optional<MongoMessage> findMessageById(String messageId);
    
    /**
     * 메시지 존재 여부 확인
     */
    boolean existsMessageById(String messageId);

    List<Map<String, Object>> getRecentMessages(int limit);
} 