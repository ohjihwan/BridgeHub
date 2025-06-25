-- =====================================================
-- BridgeHub 프로젝트 - 하이브리드 데이터베이스 구조
-- MySQL (Java Server) + MongoDB (Socket Server)
-- =====================================================

-- =====================================================
-- 1. MySQL 데이터베이스 구조 (Java Server)
-- =====================================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS bridgehub_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bridgehub_db;

-- =====================================================
-- 1.1 회원 테이블 (members)
-- =====================================================
CREATE TABLE members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_nickname (nickname)
);

-- =====================================================
-- 1.2 스터디룸 테이블 (studies)
-- =====================================================
CREATE TABLE studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    capacity INT NOT NULL DEFAULT 5,
    current_members INT NOT NULL DEFAULT 0,
    creator_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_creator_id (creator_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 1.3 스터디룸 참가자 테이블 (study_members)
-- =====================================================
CREATE TABLE study_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    member_id BIGINT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_study_member (study_id, member_id),
    INDEX idx_study_id (study_id),
    INDEX idx_member_id (member_id)
);

-- =====================================================
-- 1.4 메시지 테이블 (messages)
-- =====================================================
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    study_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('TEXT', 'FILE', 'IMAGE', 'LINK', 'SYSTEM') DEFAULT 'TEXT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE,
    INDEX idx_study_id (study_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at),
    INDEX idx_message_type (message_type)
);

-- =====================================================
-- 1.5 파일 테이블 (files)
-- =====================================================
CREATE TABLE files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by BIGINT NOT NULL,
    study_id BIGINT,
    message_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (study_id) REFERENCES studies(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_study_id (study_id),
    INDEX idx_message_id (message_id),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 1.6 링크 미리보기 테이블 (link_previews)
-- =====================================================
CREATE TABLE link_previews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(1000) NOT NULL,
    title VARCHAR(500),
    description TEXT,
    image_url VARCHAR(1000),
    site_name VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_url (url(255)),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 1.7 시스템 설정 테이블 (system_settings)
-- =====================================================
CREATE TABLE system_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- =====================================================
-- 1.8 초기 데이터 삽입
-- =====================================================

-- 시스템 설정 초기 데이터
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('max_study_capacity', '10', '스터디룸 최대 인원 수'),
('min_study_capacity', '2', '스터디룸 최소 인원 수'),
('max_file_size', '10485760', '최대 파일 크기 (10MB)'),
('allowed_file_types', 'jpg,jpeg,png,gif,pdf,doc,docx,txt', '허용된 파일 타입'),
('message_retention_days', '30', '메시지 보관 기간 (일)');

-- =====================================================
-- 2. MongoDB 구조 (Socket Server)
-- =====================================================

-- MongoDB 데이터베이스: bridgehub_socket
-- 컬렉션 구조 정의

/*
2.1 messages 컬렉션 - 실시간 메시지
{
  _id: ObjectId,
  studyId: String,                   // 스터디룸 ID
  senderId: String,                  // 발신자 ID
  senderName: String,                // 발신자 이름
  senderNickname: String,            // 발신자 닉네임
  content: String,                   // 메시지 내용
  messageType: String,               // TEXT, FILE, IMAGE, SYSTEM
  fileInfo: {                        // 파일 정보 (선택)
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    mimeType: String
  },
  timestamp: Date,                   // 전송 시간
  createdAt: Date,                   // 생성 시간
  updatedAt: Date,                   // 수정 시간
  isDeleted: Boolean                 // 삭제 여부
}

인덱스:
- { studyId: 1, timestamp: -1 }     // 스터디별 시간순 조회
- { senderId: 1, timestamp: -1 }    // 사용자별 메시지 조회
- { messageType: 1 }                // 메시지 타입별 조회
- { createdAt: 1 }                  // TTL 인덱스 (30일 후 자동 삭제)
*/

/*
2.2 chat_sessions 컬렉션 - 채팅 세션
{
  _id: ObjectId,
  studyId: String,                   // 스터디룸 ID
  userId: String,                    // 사용자 ID
  userName: String,                  // 사용자 이름
  userNickname: String,              // 사용자 닉네임
  status: String,                    // ACTIVE, INACTIVE, AWAY
  joinedAt: Date,                    // 참가 시간
  lastActivity: Date,                // 마지막 활동 시간
  lastMessageAt: Date,               // 마지막 메시지 시간
  messageCount: Number,              // 메시지 수
  socketId: String,                  // 소켓 ID
  userAgent: String,                 // 사용자 에이전트
  ipAddress: String,                 // IP 주소
  createdAt: Date,
  updatedAt: Date
}

인덱스:
- { studyId: 1 }                    // 스터디별 세션 조회
- { userId: 1 }                     // 사용자별 세션 조회
- { status: 1 }                     // 상태별 조회
- { lastActivity: 1 }               // 마지막 활동 시간
*/

/*
2.3 study_room_status 컬렉션 - 스터디룸 상태
{
  _id: ObjectId,
  studyId: String,                   // 스터디룸 ID
  studyTitle: String,                // 스터디 제목
  currentMembers: [{                 // 현재 참가자 목록
    userId: String,
    userName: String,
    userNickname: String,
    joinedAt: Date,
    status: String
  }],
  memberCount: Number,               // 현재 참가자 수
  lastMessage: {                     // 마지막 메시지 정보
    content: String,
    senderId: String,
    senderName: String,
    timestamp: Date
  },
  lastActivity: Date,                // 마지막 활동 시간
  isActive: Boolean,                 // 활성 상태
  createdAt: Date,
  updatedAt: Date
}

인덱스:
- { studyId: 1 }                    // 스터디별 상태 조회
- { lastActivity: 1 }               // 활동 시간별 조회
*/

/*
2.4 user_status 컬렉션 - 사용자 상태
{
  _id: ObjectId,
  userId: String,                    // 사용자 ID
  userName: String,                  // 사용자 이름
  userNickname: String,              // 사용자 닉네임
  status: String,                    // ONLINE, OFFLINE, AWAY, BUSY
  currentStudyId: String,            // 현재 참가 중인 스터디
  socketId: String,                  // 현재 소켓 ID
  lastSeen: Date,                    // 마지막 접속 시간
  lastActivity: Date,                // 마지막 활동 시간
  deviceInfo: {                      // 디바이스 정보
    userAgent: String,
    ipAddress: String,
    platform: String
  },
  createdAt: Date,
  updatedAt: Date
}

인덱스:
- { userId: 1 }                     // 사용자별 상태 조회
- { status: 1 }                     // 상태별 조회
- { lastSeen: 1 }                   // 마지막 접속 시간
*/

/*
2.5 system_logs 컬렉션 - 시스템 로그
{
  _id: ObjectId,
  level: String,                     // INFO, WARN, ERROR, DEBUG
  category: String,                  // CONNECTION, MESSAGE, STUDY, SYSTEM, ERROR
  studyId: String,                   // 관련 스터디 ID (선택)
  userId: String,                    // 관련 사용자 ID (선택)
  message: String,                   // 로그 메시지
  details: Object,                   // 상세 정보
  timestamp: Date,                   // 발생 시간
  createdAt: Date
}

인덱스:
- { level: 1, timestamp: -1 }       // 로그 레벨별 시간순 조회
- { studyId: 1, timestamp: -1 }     // 스터디별 로그 조회
- { userId: 1, timestamp: -1 }      // 사용자별 로그 조회
- { createdAt: 1 }                  // TTL 인덱스 (90일 후 자동 삭제)
*/

-- =====================================================
-- 3. 데이터베이스 권한 설정
-- =====================================================

-- MySQL 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'bridgehub_user'@'localhost' IDENTIFIED BY 'bridgehub_password';
GRANT ALL PRIVILEGES ON bridgehub_db.* TO 'bridgehub_user'@'localhost';
FLUSH PRIVILEGES;

-- =====================================================
-- 4. 성능 최적화 설정
-- =====================================================

-- MySQL 설정 최적화
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456;     -- 256MB
SET GLOBAL max_connections = 1000;
SET GLOBAL query_cache_size = 67108864;          -- 64MB

-- =====================================================
-- 5. 백업 및 복구 스크립트
-- =====================================================

-- MySQL 백업 명령어 (참고용)
-- mysqldump -u bridgehub_user -p bridgehub_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- MongoDB 백업 명령어 (참고용)
-- mongodump --db bridgehub_socket --out backup_$(date +%Y%m%d_%H%M%S)

-- =====================================================
-- 6. 모니터링 쿼리
-- =====================================================

-- 활성 스터디룸 수 조회
SELECT COUNT(*) as active_studies FROM studies WHERE is_active = TRUE;

-- 총 회원 수 조회
SELECT COUNT(*) as total_members FROM members;

-- 스터디룸별 참가자 수 조회
SELECT 
    s.title,
    s.current_members,
    COUNT(sm.member_id) as actual_members
FROM studies s
LEFT JOIN study_members sm ON s.id = sm.study_id
WHERE s.is_active = TRUE
GROUP BY s.id, s.title, s.current_members;

-- 최근 메시지 통계
SELECT 
    DATE(created_at) as date,
    COUNT(*) as message_count,
    COUNT(DISTINCT sender_id) as unique_senders
FROM messages
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- =====================================================
-- 7. 정리 및 주의사항
-- =====================================================

/*
주의사항:
1. MongoDB는 별도로 설치 및 설정이 필요합니다.
2. 환경 변수에서 MONGODB_URI를 올바르게 설정하세요.
3. TTL 인덱스는 자동으로 오래된 데이터를 삭제합니다.
4. 정기적인 백업을 수행하세요.
5. 성능 모니터링을 통해 인덱스를 최적화하세요.

사용법:
1. MySQL 스키마 실행: mysql -u root -p < mysqlmongoDB.sql
2. MongoDB 연결 확인: curl http://localhost:7500/health/mongodb
3. 데이터베이스 상태 모니터링: 위의 모니터링 쿼리 사용
*/
