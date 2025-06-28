-- members 테이블 확인 및 신고 데이터 생성
USE thebridgehub;

-- 1. members 테이블의 실제 ID 확인
SELECT id, userid, nickname FROM members ORDER BY id;

-- 2. 기존 신고 데이터 삭제
SET SQL_SAFE_UPDATES = 0;
DELETE FROM Report;
SET SQL_SAFE_UPDATES = 1;

-- 3. 실제 존재하는 member ID로 신고 데이터 생성
-- (위 쿼리 결과를 보고 실제 존재하는 ID로 수정해야 함)
INSERT INTO Report (reporter_id, reported_user_id, report_type, reason, created_at, status, admin_comment) VALUES
-- 예시: 실제 존재하는 ID로 변경 필요
(1, 2, 'USER', '부적절한 언행', '2024-01-15 10:30:00', 'PENDING', NULL),
(2, 3, 'USER', '스팸 메시지', '2024-01-16 14:20:00', 'PENDING', NULL),
(3, 4, 'USER', '부적절한 게시글', '2024-01-17 09:15:00', 'RESOLVED', '부적절한 내용으로 판단되어 경고 처리'),
(4, 5, 'USER', '허위 정보', '2024-01-18 16:45:00', 'PENDING', NULL),
(5, 6, 'USER', '욕설 사용', '2024-01-19 11:30:00', 'RESOLVED', '욕설 사용으로 인한 경고');

-- 4. 신고 데이터 확인
SELECT 
    r.report_id,
    r.report_type,
    r.reason,
    r.status,
    r.created_at,
    r.admin_comment,
    CONCAT(m1.nickname, ' (', m1.userid, ')') as reporter,
    CONCAT(m2.nickname, ' (', m2.userid, ')') as reported_user
FROM Report r
JOIN members m1 ON r.reporter_id = m1.id
JOIN members m2 ON r.reported_user_id = m2.id
ORDER BY r.created_at DESC; 