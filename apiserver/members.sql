-- =============================================
-- TheBridgeHub 데이터베이스 스키마 (완전판)
-- 채팅 로그 시스템 + 스터디 참가 시스템 포함
-- =============================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS thebridgehub 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 데이터베이스 사용
USE thebridgehub;

-- =============================================
-- 1. 회원 테이블 (memberInfo 통합)
-- =============================================
CREATE TABLE members (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '회원 ID (PK)',
    userid VARCHAR(100) NOT NULL UNIQUE COMMENT '아이디(이메일)',
    phone VARCHAR(20) COMMENT '전화번호',
    nickname VARCHAR(50) COMMENT '닉네임',
    name VARCHAR(50) NOT NULL COMMENT '이름',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (암호화)',
    education VARCHAR(100) COMMENT '학력',
    department VARCHAR(100) COMMENT '학과/전공',
    gender ENUM('남자','여자') COMMENT '성별',
    region VARCHAR(100) COMMENT '지역',
    district VARCHAR(100) COMMENT '구/군',
    time VARCHAR(20) COMMENT '선호 시간대 (오전/오후/저녁)',
    profile_image VARCHAR(500) COMMENT '프로필 이미지 경로',
    status ENUM('ACTIVE','BANNED','DELETED') DEFAULT 'ACTIVE' COMMENT '계정 상태',
    email_verified BOOLEAN DEFAULT FALSE COMMENT '이메일 인증 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='회원 정보';

-- =============================================
-- 2. 채팅방 테이블
-- =============================================
CREATE TABLE ChatRoom (
    room_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '채팅방 ID (PK)',
    room_name VARCHAR(100) NOT NULL COMMENT '채팅방 이름',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    max_members INT DEFAULT 10 COMMENT '최대 인원 수',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성 상태'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅방';

-- =============================================
-- 3. 채팅방 멤버 관계 테이블 (다대다 관계)
-- =============================================
CREATE TABLE ChatRoomMember (
    room_id INT NOT NULL COMMENT '채팅방 ID',
    member_id INT NOT NULL COMMENT '회원 ID',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '참여 시간',
    is_admin BOOLEAN DEFAULT FALSE COMMENT '방 관리자 여부',
    PRIMARY KEY (room_id, member_id),
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅방 멤버';

-- =============================================
-- 4. 메시지 테이블 (로그 시스템 연동)
-- =============================================
CREATE TABLE Message (
    message_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메시지 ID (PK)',
    room_id INT NOT NULL COMMENT '채팅방 ID (FK)',
    sender_id INT NOT NULL COMMENT '보낸 사람 ID (FK)',
    content TEXT NOT NULL COMMENT '메시지 내용',
    message_type ENUM('TEXT', 'FILE', 'IMAGE') DEFAULT 'TEXT' COMMENT '메시지 타입',
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '보낸 시간',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    
    -- 로그 시스템 관련 필드
    is_logged BOOLEAN DEFAULT FALSE COMMENT '로그 파일에 저장 여부',
    log_file_id INT COMMENT '연결된 로그 파일 ID',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='메시지 (임시 저장 + 백업)';

-- =============================================
-- 5. 채팅 로그 파일 관리 테이블
-- =============================================
CREATE TABLE chat_log_files (
    log_file_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '로그 파일 ID',
    room_id INT NOT NULL COMMENT '채팅방 ID',
    log_date DATE NOT NULL COMMENT '로그 날짜 (YYYY-MM-DD)',
    file_path VARCHAR(500) NOT NULL COMMENT '로그 파일 경로',
    file_name VARCHAR(255) NOT NULL COMMENT '로그 파일명',
    message_count INT DEFAULT 0 COMMENT '해당 날짜 메시지 개수',
    file_size BIGINT DEFAULT 0 COMMENT '파일 크기 (bytes)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '마지막 업데이트',
    is_archived BOOLEAN DEFAULT FALSE COMMENT '아카이브 여부',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    UNIQUE KEY unique_room_date (room_id, log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='채팅 로그 파일 관리';

-- =============================================
-- 6. 스터디룸 테이블 (Java 엔티티명: studyroom)
-- =============================================
CREATE TABLE studyroom (
    study_room_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '스터디룸 ID',
    room_id INT NOT NULL UNIQUE COMMENT '채팅방 ID (FK)',
    boss_id INT NOT NULL COMMENT '방장 ID',
    title VARCHAR(255) NOT NULL COMMENT '스터디 제목',
    description TEXT COMMENT '스터디 설명',
    education VARCHAR(100) COMMENT '학력 요구사항',
    department VARCHAR(100) COMMENT '학과/전공 요구사항',
    region VARCHAR(100) COMMENT '지역',
    district VARCHAR(100) COMMENT '구/군',
    capacity INT DEFAULT 10 COMMENT '최대 참가자 수',
    current_members INT DEFAULT 1 COMMENT '현재 참가자 수',
    time VARCHAR(20) COMMENT '선호 시간대 (오전/오후/저녁)',
    thumbnail VARCHAR(255) COMMENT '썸네일 이미지 경로',
    is_public BOOLEAN DEFAULT TRUE COMMENT '공개 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE CASCADE,
    FOREIGN KEY (boss_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='스터디룸';

-- =============================================
-- 7. 스터디룸 멤버 관리 테이블 ⭐ 새로 추가
-- =============================================
CREATE TABLE study_room_members (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '스터디 멤버 ID',
    study_room_id INT NOT NULL COMMENT '스터디룸 ID (FK)',
    member_id INT NOT NULL COMMENT '회원 ID (FK)',
    role ENUM('BOSS', 'MEMBER') DEFAULT 'MEMBER' COMMENT '역할 (방장/멤버)',
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '상태 (대기/승인/거절)',
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '참가 신청 시간',
    approved_at DATETIME NULL COMMENT '승인 시간',
    approved_by INT NULL COMMENT '승인자 ID (FK)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 시간',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 시간',
    
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES members(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_member_study (study_room_id, member_id),
    INDEX idx_study_room_members_study_id (study_room_id),
    INDEX idx_study_room_members_member_id (member_id),
    INDEX idx_study_room_members_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='스터디룸 멤버 관리';

-- =============================================
-- 8. 신고 테이블 (로그 시스템 연동)
-- =============================================
CREATE TABLE Report (
    report_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '신고 ID (PK)',
    reporter_id INT NOT NULL COMMENT '신고자 ID (FK)',
    reported_user_id INT COMMENT '신고 대상 회원 ID (FK)',
    report_type ENUM('USER', 'MESSAGE', 'STUDYROOM', 'INAPPROPRIATE_CONTENT') NOT NULL COMMENT '신고 유형',
    message_id INT COMMENT '신고한 메시지 ID (FK)',
    room_id INT COMMENT '신고한 채팅방 ID (FK)',
    study_room_id INT COMMENT '스터디룸 ID (FK)',
    reason VARCHAR(255) NOT NULL COMMENT '신고 사유',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '신고 시간',
    status ENUM('PENDING', 'PROCESSING', 'RESOLVED', 'REJECTED') DEFAULT 'PENDING' COMMENT '처리 상태',
    admin_comment TEXT COMMENT '관리자 코멘트',
    
    -- 로그 시스템 관련 필드
    log_file_id INT COMMENT '신고 관련 로그 파일 ID',
    log_message_index INT COMMENT '로그 파일 내 메시지 인덱스',
    
    FOREIGN KEY (reporter_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES members(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES Message(message_id) ON DELETE SET NULL,
    FOREIGN KEY (room_id) REFERENCES ChatRoom(room_id) ON DELETE SET NULL,
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE SET NULL,
    FOREIGN KEY (log_file_id) REFERENCES chat_log_files(log_file_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='신고';

-- =============================================
-- 9. 파일 테이블
-- =============================================
CREATE TABLE file (
    file_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '파일 ID',
    file_type ENUM('MESSAGE', 'PROFILE', 'STUDY_THUMBNAIL', 'STUDY_ATTACHMENT') NOT NULL COMMENT '파일 유형',
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (bytes)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME 타입',
    file_hash VARCHAR(64) COMMENT '파일 해시 (중복 방지)',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '업로드 시간',
    
    -- 파일 유형별 참조 ID들
    message_id INT COMMENT '메시지 ID (FK) - file_type이 MESSAGE일 때',
    member_id INT COMMENT '회원 ID (FK) - file_type이 PROFILE일 때',
    study_room_id INT COMMENT '스터디룸 ID (FK) - file_type이 STUDY_*일 때',
    
    FOREIGN KEY (message_id) REFERENCES Message(message_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (study_room_id) REFERENCES studyroom(study_room_id) ON DELETE CASCADE,
    
    -- 파일 유형별 제약조건
    CONSTRAINT chk_file_references CHECK (
        (file_type = 'MESSAGE' AND message_id IS NOT NULL AND member_id IS NULL AND study_room_id IS NULL) OR
        (file_type = 'PROFILE' AND member_id IS NOT NULL AND message_id IS NULL AND study_room_id IS NULL) OR
        (file_type IN ('STUDY_THUMBNAIL', 'STUDY_ATTACHMENT') AND study_room_id IS NOT NULL AND message_id IS NULL AND member_id IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='파일';

-- =============================================
-- 10. 트리거 생성 (스터디 멤버 자동 관리)
-- =============================================

-- 스터디룸 생성 시 방장 자동 추가 트리거
DELIMITER //
CREATE TRIGGER after_studyroom_insert 
AFTER INSERT ON studyroom
FOR EACH ROW
BEGIN
    INSERT INTO study_room_members (study_room_id, member_id, role, status, approved_at)
    VALUES (NEW.study_room_id, NEW.boss_id, 'BOSS', 'APPROVED', NOW());
END//
DELIMITER ;

-- 스터디룸 멤버 수 업데이트 트리거
DELIMITER //
CREATE TRIGGER update_study_room_member_count
AFTER UPDATE ON study_room_members
FOR EACH ROW
BEGIN
    IF NEW.status = 'APPROVED' AND OLD.status != 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = NEW.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = NEW.study_room_id;
    ELSEIF NEW.status != 'APPROVED' AND OLD.status = 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = NEW.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = NEW.study_room_id;
    END IF;
END//
DELIMITER ;

-- 스터디룸 멤버 삭제 시 멤버 수 업데이트 트리거
DELIMITER //
CREATE TRIGGER after_study_member_delete
AFTER DELETE ON study_room_members
FOR EACH ROW
BEGIN
    IF OLD.status = 'APPROVED' THEN
        UPDATE studyroom 
        SET current_members = (
            SELECT COUNT(*) 
            FROM study_room_members 
            WHERE study_room_id = OLD.study_room_id AND status = 'APPROVED'
        )
        WHERE study_room_id = OLD.study_room_id;
    END IF;
END//
DELIMITER ;

-- =============================================
-- 11. 인덱스 생성
-- =============================================

-- 회원 관련 인덱스
CREATE INDEX idx_members_userid ON members(userid);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_department ON members(department);
CREATE INDEX idx_members_region ON members(region);
CREATE INDEX idx_members_district ON members(district);
CREATE INDEX idx_members_time ON members(time);

-- 메시지 관련 인덱스
CREATE INDEX idx_message_room_id ON Message(room_id);
CREATE INDEX idx_message_sender_id ON Message(sender_id);
CREATE INDEX idx_message_sent_at ON Message(sent_at);
CREATE INDEX idx_message_is_logged ON Message(is_logged);
CREATE INDEX idx_message_log_file_id ON Message(log_file_id);

-- 채팅 로그 파일 관련 인덱스
CREATE INDEX idx_chat_log_room_date ON chat_log_files(room_id, log_date);
CREATE INDEX idx_chat_log_created_at ON chat_log_files(created_at);
CREATE INDEX idx_chat_log_is_archived ON chat_log_files(is_archived);

-- 채팅방 멤버 관련 인덱스
CREATE INDEX idx_chatroom_member_room_id ON ChatRoomMember(room_id);
CREATE INDEX idx_chatroom_member_member_id ON ChatRoomMember(member_id);

-- 신고 관련 인덱스
CREATE INDEX idx_report_reporter_id ON Report(reporter_id);
CREATE INDEX idx_report_reported_user_id ON Report(reported_user_id);
CREATE INDEX idx_report_status ON Report(status);
CREATE INDEX idx_report_created_at ON Report(created_at);
CREATE INDEX idx_report_log_file_id ON Report(log_file_id);

-- 파일 관련 인덱스
CREATE INDEX idx_file_message_id ON file(message_id);
CREATE INDEX idx_file_member_id ON file(member_id);
CREATE INDEX idx_file_study_room_id ON file(study_room_id);
CREATE INDEX idx_file_type ON file(file_type);
CREATE INDEX idx_file_hash ON file(file_hash);

-- 스터디룸 관련 인덱스
CREATE INDEX idx_study_room_boss_id ON studyroom(boss_id);
CREATE INDEX idx_study_room_is_public ON studyroom(is_public);
CREATE INDEX idx_study_room_region ON studyroom(region);
CREATE INDEX idx_study_room_district ON studyroom(district);
CREATE INDEX idx_study_room_time ON studyroom(time);
CREATE INDEX idx_study_room_department ON studyroom(department);

-- 스터디룸 멤버 관련 인덱스 (이미 테이블 생성시 포함됨)
-- CREATE INDEX idx_study_room_members_study_id ON study_room_members(study_room_id);
-- CREATE INDEX idx_study_room_members_member_id ON study_room_members(member_id);
-- CREATE INDEX idx_study_room_members_status ON study_room_members(status);

-- =============================================
-- 12. 테이블 설명 및 사용 목적
-- =============================================

/*
테이블 구조 설명:

1. members: 회원 정보 (이메일 인증, 프로필 등)
2. ChatRoom: 채팅방 기본 정보
3. ChatRoomMember: 채팅방-회원 다대다 관계
4. Message: 메시지 임시 저장 + 백업 (로그 시스템과 연동)
5. chat_log_files: 채팅 로그 파일 메타데이터 관리
6. studyroom: 스터디룸 정보 (채팅방과 1:1 연결)
7. study_room_members: 스터디룸 멤버 관리 (참가 신청/승인 시스템) ⭐ 새로 추가
8. Report: 신고 기능 (로그 파일 증거 수집 지원)
9. file: 파일 업로드/다운로드 관리

스터디 참가 시스템 특징:
- 스터디 참가 신청 → PENDING 상태
- 방장이 승인/거절 → APPROVED/REJECTED 상태
- 승인 시 채팅방에 자동 참가
- 탈퇴 시 채팅방에서 자동 퇴장
- 트리거로 멤버 수 자동 관리

채팅 로그 시스템 특징:
- 메시지는 DB(임시) + 로그파일(영구) 이중 저장
- 로그 파일은 날짜별로 분리 (room_1_2024-01-15.log)
- 신고 시 로그 파일에서 증거 수집
- 30일 후 임시 메시지 자동 정리
- 실시간 성능 최적화 + 대용량 데이터 효율 관리

연동 시스템:
- 스터디룸 ↔ 채팅방 (1:1 연결)
- 스터디 멤버 ↔ 채팅 멤버 (자동 동기화)
- 스터디 참가 승인 → 채팅방 자동 참가
- 스터디 탈퇴 → 채팅방 자동 퇴장
*/
