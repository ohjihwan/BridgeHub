package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.entity.MongoMessage;
import com.koreait.apiserver.repository.MongoMessageRepository;
import com.koreait.apiserver.service.MongoMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MongoMessageServiceImpl implements MongoMessageService {
    
    private final MongoMessageRepository mongoMessageRepository;
    
    @Override
    public Optional<MongoMessage> findMessageById(String messageId) {
        try {
            log.info("MongoDB에서 메시지 조회: messageId={}", messageId);
            Optional<MongoMessage> message = mongoMessageRepository.findById(messageId);
            
            if (message.isPresent()) {
                log.info("메시지 조회 성공: messageId={}, senderId={}, message={}", 
                        messageId, message.get().getSenderId(), 
                        message.get().getMessage() != null ? message.get().getMessage().substring(0, Math.min(50, message.get().getMessage().length())) + "..." : "null");
            } else {
                log.warn("메시지를 찾을 수 없음: messageId={}", messageId);
            }
            
            return message;
        } catch (Exception e) {
            log.error("MongoDB 메시지 조회 실패: messageId={}", messageId, e);
            return Optional.empty();
        }
    }
    
    @Override
    public boolean existsMessageById(String messageId) {
        try {
            boolean exists = mongoMessageRepository.existsById(messageId);
            log.info("메시지 존재 여부 확인: messageId={}, exists={}", messageId, exists);
            return exists;
        } catch (Exception e) {
            log.error("MongoDB 메시지 존재 여부 확인 실패: messageId={}", messageId, e);
            return false;
        }
    }
} 