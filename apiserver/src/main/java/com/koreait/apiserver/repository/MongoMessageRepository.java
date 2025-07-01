package com.koreait.apiserver.repository;

import com.koreait.apiserver.entity.MongoMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MongoMessageRepository extends MongoRepository<MongoMessage, String> {
    
    /**
     * 메시지 ID로 메시지 조회
     */
    Optional<MongoMessage> findById(String messageId);
    
    /**
     * 스터디룸의 메시지들 조회
     */
    List<MongoMessage> findByStudyIdOrderByTimestampAsc(String studyId);
    
    /**
     * 특정 사용자가 보낸 메시지들 조회
     */
    List<MongoMessage> findByStudyIdAndSenderIdOrderByTimestampAsc(String studyId, String senderId);
    
    /**
     * 특정 기간의 메시지들 조회
     */
    @Query("{'studyId': ?0, 'timestamp': {$gte: ?1, $lte: ?2}}")
    List<MongoMessage> findByStudyIdAndTimestampBetween(String studyId, String startDate, String endDate);
} 