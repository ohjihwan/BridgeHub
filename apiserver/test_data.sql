-- 관리자 페이지 테스트 데이터

-- 1. 회원 테스트 데이터
INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, profile_image, status, email_verified, description, created_at, updated_at) VALUES
('admin@test.com', '010-1234-5678', '관리자', '김관리', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '컴퓨터공학과', '남성', '서울특별시', '강남구', '저녁', 'default-profile1.png', 'ACTIVE', true, '시스템 관리자입니다.', NOW(), NOW()),
('user1@test.com', '010-1111-1111', '사용자1', '김철수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '전자공학과', '남성', '서울특별시', '서초구', '오후', 'default-profile2.png', 'ACTIVE', true, '안녕하세요!', NOW(), NOW()),
('user2@test.com', '010-2222-2222', '사용자2', '이영희', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '경영학과', '여성', '부산광역시', '해운대구', '오전', 'default-profile1.png', 'ACTIVE', true, '반갑습니다!', NOW(), NOW()),
('user3@test.com', '010-3333-3333', '사용자3', '박민수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '기계공학과', '남성', '대구광역시', '수성구', '저녁', 'default-profile2.png', 'INACTIVE', true, '비활성 계정입니다.', NOW(), NOW()),
('user4@test.com', '010-4444-4444', '사용자4', '최지영', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '화학공학과', '여성', '인천광역시', '연수구', '오후', 'default-profile1.png', 'ACTIVE', true, '화학을 좋아합니다!', NOW(), NOW());

-- 2. 신고 테스트 데이터
INSERT INTO reports (reporter_id, reported_user_id, report_type, reason, description, status, created_at, updated_at) VALUES
(2, 3, 'USER', '부적절한 언행', '상대방이 부적절한 말을 사용했습니다.', 'PENDING', NOW(), NOW()),
(3, 4, 'CHAT', '스팸 메시지', '채팅방에서 스팸 메시지를 계속 보냅니다.', 'PENDING', NOW(), NOW()),
(4, 2, 'POST', '부적절한 게시글', '게시글이 부적절한 내용을 포함하고 있습니다.', 'RESOLVED', NOW(), NOW()),
(2, 5, 'USER', '허위 정보', '프로필에 허위 정보를 기재했습니다.', 'PENDING', NOW(), NOW()),
(5, 3, 'CHAT', '욕설 사용', '채팅방에서 욕설을 사용했습니다.', 'RESOLVED', NOW(), NOW());

-- 3. 스터디룸 테스트 데이터
INSERT INTO studyrooms (title, description, subject, max_members, current_members, status, created_by, created_at, updated_at) VALUES
('Java 스터디', 'Java 프로그래밍을 함께 공부하는 스터디입니다.', '프로그래밍', 5, 3, 'ACTIVE', 2, NOW(), NOW()),
('영어 회화', '영어 회화를 연습하는 스터디입니다.', '외국어', 8, 5, 'ACTIVE', 3, NOW(), NOW()),
('수학 스터디', '고등학교 수학을 복습하는 스터디입니다.', '수학', 6, 4, 'ACTIVE', 4, NOW(), NOW()),
('독서 모임', '책을 읽고 토론하는 모임입니다.', '인문학', 10, 7, 'ACTIVE', 5, NOW(), NOW());

-- 4. 채팅방 테스트 데이터
INSERT INTO chatrooms (name, description, max_members, current_members, status, created_by, created_at, updated_at) VALUES
('일반 채팅방', '일반적인 대화를 나누는 채팅방입니다.', 20, 8, 'ACTIVE', 2, NOW(), NOW()),
('스터디 채팅방', '스터디 관련 대화를 나누는 채팅방입니다.', 15, 12, 'ACTIVE', 3, NOW(), NOW()),
('취미 채팅방', '취미에 대해 이야기하는 채팅방입니다.', 25, 18, 'ACTIVE', 4, NOW(), NOW());

-- 5. 메시지 테스트 데이터
INSERT INTO messages (chatroom_id, sender_id, content, message_type, created_at) VALUES
(1, 2, '안녕하세요!', 'TEXT', NOW()),
(1, 3, '반갑습니다!', 'TEXT', NOW()),
(1, 4, '오늘 날씨가 좋네요', 'TEXT', NOW()),
(2, 2, '스터디 시작할까요?', 'TEXT', NOW()),
(2, 3, '네, 준비되었습니다!', 'TEXT', NOW()),
(3, 4, '취미가 무엇인가요?', 'TEXT', NOW()),
(3, 5, '독서를 좋아합니다!', 'TEXT', NOW()); 