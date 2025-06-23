package com.koreait.thebridgehub.dao;

import com.koreait.thebridgehub.entity.File;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface FileDao {
    
    // 파일 등록
    int insertFile(File file);
    
    // 파일 조회 (ID로)
    Optional<File> findById(Integer fileId);
    
    // 파일 조회 (ID로) - null 반환 가능
    File getFileById(Integer fileId);
    
    // 메시지별 파일 조회
    List<File> findByMessageId(Integer messageId);
    
    // 메시지별 파일 조회 (서비스용)
    List<File> getFilesByMessageId(Integer messageId);
    
    // 회원별 파일 조회 (프로필 이미지 등)
    List<File> findByMemberId(Integer memberId);
    
    // 회원별 파일 조회 (서비스용)
    List<File> getFilesByMemberId(Integer memberId);
    
    // 스터디룸별 파일 조회
    List<File> findByStudyroomId(Integer studyroomId);
    
    // 스터디룸별 파일 조회 (서비스용)
    List<File> getFilesByStudyRoomId(Integer studyRoomId);
    
    // 파일 타입별 조회
    List<File> findByFileType(String fileType);
    
    // 파일 해시로 조회 (중복 방지)
    Optional<File> findByFileHash(String fileHash);
    
    // 파일 정보 수정
    int updateFile(File file);
    
    // 파일 소프트 삭제
    int softDeleteFile(Integer fileId);
    
    // 파일 완전 삭제
    int deleteFile(Integer fileId);
    
    // 저장된 파일명으로 조회 (기존 호환성)
    Optional<File> findByStoredName(String storedName);
    
    // 스터디룸별 파일 삭제 (기존 Board와의 호환성)
    int deleteByBoardId(Integer boardId);
    
    // 스터디룸별 파일 조회 (기존 Board와의 호환성)
    List<File> findByBoardId(Integer boardId);
} 