-- 데이터베이스 사용
USE thebridgehub;

-- =============================================
-- 1. members 테이블 status 컬럼 수정 (SUSPENDED 추가)
-- =============================================
ALTER TABLE members MODIFY COLUMN status ENUM('ACTIVE','BANNED','DELETED','SUSPENDED') DEFAULT 'ACTIVE';

-- =============================================
-- 2. 기존 테스트 데이터 삭제 (있다면)
-- =============================================
DELETE FROM study_room_members WHERE member_id IN (SELECT id FROM members WHERE userid LIKE 'test%');
DELETE FROM Report WHERE reporter_id IN (SELECT id FROM members WHERE userid LIKE 'test%') OR reported_user_id IN (SELECT id FROM members WHERE userid LIKE 'test%');
DELETE FROM Message WHERE sender_id IN (SELECT id FROM members WHERE userid LIKE 'test%');
DELETE FROM ChatRoomMember WHERE member_id IN (SELECT id FROM members WHERE userid LIKE 'test%');
DELETE FROM studyroom WHERE boss_id IN (SELECT id FROM members WHERE userid LIKE 'test%');
DELETE FROM members WHERE userid LIKE 'test%';
DELETE FROM ChatRoom WHERE room_name LIKE '%스터디%' OR room_name LIKE '%공유방%' OR room_name LIKE '%게시판%';

-- =============================================
-- 3. 테스트 회원 데이터 추가
-- =============================================
INSERT INTO members (userid, phone, nickname, name, password, education, department, gender, region, district, time, status, email_verified, created_at) VALUES
('test1@example.com', '010-1234-5678', '민우', '이민우', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '컴퓨터공학', '남자', '서울특별시', '강남구', '12:00-18:00', 'ACTIVE', true, '2024-01-15 10:00:00'),
('test2@example.com', '010-2345-6789', '지환', '오지환', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학원', '금융공학', '남자', '부산광역시', '해운대구', '18:00-24:00', 'ACTIVE', true, '2024-02-10 14:30:00'),
('test3@example.com', '010-3456-7890', '현지', '노현지', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '고졸', '통계학', '여자', '대구광역시', '수성구', '06:00-12:00', 'ACTIVE', true, '2024-03-05 09:15:00'),
('test4@example.com', '010-4567-8901', '철수', '김철수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '경영학', '남자', '인천광역시', '연수구', '12:00-18:00', 'ACTIVE', true, '2024-01-20 16:45:00'),
('test5@example.com', '010-5678-9012', '영희', '최영희', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학원', '심리학', '여자', '광주광역시', '서구', '18:00-24:00', 'ACTIVE', true, '2024-02-25 11:20:00'),
('test6@example.com', '010-6789-0123', '지민', '한지민', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '의학', '여자', '대전광역시', '유성구', '06:00-12:00', 'ACTIVE', true, '2024-03-15 13:10:00'),
('test7@example.com', '010-7890-1234', '민수', '정민수', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '고졸', '법학', '남자', '울산광역시', '남구', '12:00-18:00', 'SUSPENDED', true, '2024-01-30 15:30:00'),
('test8@example.com', '010-8901-2345', '혜교', '송혜교', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '예체능', '여자', '세종특별자치시', '세종시', '18:00-24:00', 'ACTIVE', true, '2024-02-18 10:45:00'),
('test9@example.com', '010-9012-3456', '준호', '박준호', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학원', '물리학', '남자', '경기도', '수원시', '06:00-12:00', 'ACTIVE', true, '2024-03-08 14:20:00'),
('test10@example.com', '010-0123-4567', '수진', '이수진', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '대학교', '화학공학', '여자', '강원도', '춘천시', '12:00-18:00', 'ACTIVE', true, '2024-01-12 12:00:00');

-- =============================================
-- 4. 채팅방 데이터 추가
-- =============================================
INSERT INTO ChatRoom (room_name, created_at, max_members, is_active) VALUES
('프로그래밍 스터디 A', '2024-01-15 10:00:00', 10, true),
('영어 스터디 B', '2024-01-20 14:00:00', 8, true),
('취미 공유방', '2024-02-01 16:00:00', 15, true),
('자유게시판', '2024-02-10 09:00:00', 20, true),
('정보공유방', '2024-02-15 11:00:00', 12, true);

-- =============================================
-- 5. 채팅방 멤버 데이터 추가
-- =============================================
INSERT INTO ChatRoomMember (room_id, member_id, joined_at, is_admin) VALUES
(1, 1, '2024-01-15 10:00:00', true),
(1, 2, '2024-01-15 10:30:00', false),
(1, 3, '2024-01-16 09:00:00', false),
(2, 4, '2024-01-20 14:00:00', true),
(2, 5, '2024-01-21 15:00:00', false),
(2, 6, '2024-01-22 16:00:00', false),
(3, 7, '2024-02-01 16:00:00', true),
(3, 8, '2024-02-02 17:00:00', false),
(4, 9, '2024-02-10 09:00:00', true),
(4, 10, '2024-02-11 10:00:00', false),
(5, 1, '2024-02-15 11:00:00', true),
(5, 4, '2024-02-16 12:00:00', false);

-- =============================================
-- 6. 메시지 데이터 추가
-- =============================================
INSERT INTO Message (room_id, sender_id, content, message_type, sent_at) VALUES
(1, 1, '안녕하세요! 프로그래밍 스터디에 오신 것을 환영합니다.', 'TEXT', '2024-01-15 10:00:00'),
(1, 2, '반갑습니다! 잘 부탁드립니다.', 'TEXT', '2024-01-15 10:30:00'),
(1, 3, '저도 참여하게 되어서 기쁩니다.', 'TEXT', '2024-01-16 09:00:00'),
(2, 4, '영어 스터디 시작합니다!', 'TEXT', '2024-01-20 14:00:00'),
(2, 5, '네! 열심히 하겠습니다.', 'TEXT', '2024-01-21 15:00:00'),
(2, 6, '영어 공부 화이팅!', 'TEXT', '2024-01-22 16:00:00'),
(3, 7, '취미 공유방에 오신 것을 환영합니다!', 'TEXT', '2024-02-01 16:00:00'),
(3, 8, '다양한 취미를 공유해보아요.', 'TEXT', '2024-02-02 17:00:00'),
(4, 9, '자유게시판입니다. 자유롭게 글을 써주세요.', 'TEXT', '2024-02-10 09:00:00'),
(4, 10, '좋은 정보 많이 공유하겠습니다.', 'TEXT', '2024-02-11 10:00:00'),
(5, 1, '정보공유방입니다. 유용한 정보를 공유해주세요.', 'TEXT', '2024-02-15 11:00:00'),
(5, 4, '네! 도움이 되는 정보를 많이 올리겠습니다.', 'TEXT', '2024-02-16 12:00:00');

-- =============================================
-- 7. 스터디룸 데이터 추가
-- =============================================
INSERT INTO studyroom (room_id, boss_id, title, description, education, department, region, district, capacity, current_members, time, is_public, created_at) VALUES
(1, 1, '프로그래밍 기초 스터디', '프로그래밍 기초를 함께 공부하는 스터디입니다.', '대학교', '컴퓨터공학', '서울특별시', '강남구', 10, 3, '12:00-18:00', true, '2024-01-15 10:00:00'),
(2, 4, '영어 회화 스터디', '영어 회화를 연습하는 스터디입니다.', '대학교', '영어영문학', '부산광역시', '해운대구', 8, 3, '18:00-24:00', true, '2024-01-20 14:00:00'),
(3, 7, '취미 공유 스터디', '다양한 취미를 공유하는 스터디입니다.', '고졸', '무관', '대구광역시', '수성구', 15, 2, '06:00-12:00', true, '2024-02-01 16:00:00');

-- =============================================
-- 8. 신고 데이터 추가
-- =============================================
INSERT INTO Report (reporter_id, reported_user_id, report_type, message_id, room_id, reason, created_at, status, admin_comment) VALUES
(1, 2, 'MESSAGE', 2, 1, '욕설', '2024-01-15 14:30:25', 'PENDING', NULL),
(3, 1, 'MESSAGE', 1, 1, '스팸', '2024-01-14 09:15:42', 'RESOLVED', '광고성 메시지로 판단되어 경고 처리'),
(4, 5, 'MESSAGE', 5, 2, '부적절한 콘텐츠', '2024-01-13 16:45:18', 'PENDING', NULL),
(6, 7, 'MESSAGE', 7, 3, '괴롭힘', '2024-01-12 11:20:33', 'RESOLVED', '지속적인 괴롭힘 행위로 인한 채팅 제한 30일'),
(8, 9, 'MESSAGE', 9, 4, '저작권 침해', '2024-01-11 13:55:07', 'PENDING', NULL),
(10, 1, 'USER', NULL, NULL, '부적절한 프로필', '2024-01-10 10:30:15', 'PENDING', NULL),
(2, 3, 'MESSAGE', 3, 1, '광고성 메시지', '2024-01-09 15:20:45', 'RESOLVED', '광고성 메시지 반복 등록으로 인한 제재'),
(5, 6, 'MESSAGE', 6, 2, '음란성 콘텐츠', '2024-01-08 20:10:30', 'PENDING', NULL),
(7, 8, 'MESSAGE', 8, 3, '폭력적 발언', '2024-01-07 12:45:22', 'RESOLVED', '폭력적 발언으로 인한 계정 정지 7일'),
(9, 10, 'MESSAGE', 10, 4, '허위 정보', '2024-01-06 18:30:55', 'PENDING', NULL);

-- =============================================
-- 9. 스터디룸 멤버 데이터 추가
-- =============================================
INSERT INTO study_room_members (study_room_id, member_id, role, status, joined_at, approved_at, approved_by) VALUES
(1, 1, 'BOSS', 'APPROVED', '2024-01-15 10:00:00', '2024-01-15 10:00:00', 1),
(1, 2, 'MEMBER', 'APPROVED', '2024-01-15 10:30:00', '2024-01-15 11:00:00', 1),
(1, 3, 'MEMBER', 'APPROVED', '2024-01-16 09:00:00', '2024-01-16 09:30:00', 1),
(2, 4, 'BOSS', 'APPROVED', '2024-01-20 14:00:00', '2024-01-20 14:00:00', 4),
(2, 5, 'MEMBER', 'APPROVED', '2024-01-21 15:00:00', '2024-01-21 15:30:00', 4),
(2, 6, 'MEMBER', 'APPROVED', '2024-01-22 16:00:00', '2024-01-22 16:30:00', 4),
(3, 7, 'BOSS', 'APPROVED', '2024-02-01 16:00:00', '2024-02-01 16:00:00', 7),
(3, 8, 'MEMBER', 'APPROVED', '2024-02-02 17:00:00', '2024-02-02 17:30:00', 7);

-- =============================================
-- 10. 데이터 확인
-- =============================================
SELECT 'Members' as table_name, COUNT(*) as count FROM members WHERE userid LIKE 'test%'
UNION ALL
SELECT 'ChatRooms' as table_name, COUNT(*) as count FROM ChatRoom
UNION ALL
SELECT 'Reports' as table_name, COUNT(*) as count FROM Report
UNION ALL
SELECT 'StudyRooms' as table_name, COUNT(*) as count FROM studyroom;

-- =============================================
-- 11. 상세 데이터 확인
-- =============================================
SELECT 'Members' as info_type, id, userid, name, status FROM members WHERE userid LIKE 'test%' ORDER BY id;
SELECT 'ChatRooms' as info_type, room_id, room_name FROM ChatRoom ORDER BY room_id;
SELECT 'StudyRooms' as info_type, study_room_id, room_id, title FROM studyroom ORDER BY study_room_id;
SELECT 'Reports' as info_type, report_id, reporter_id, reported_user_id, reason, status FROM Report ORDER BY report_id; 