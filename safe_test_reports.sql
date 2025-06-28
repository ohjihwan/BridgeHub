-- 안전한 신고 테스트 데이터 생성
USE thebridgehub;

-- 기존 신고 데이터 삭제 (안전 모드 해제)
SET SQL_SAFE_UPDATES = 0;
DELETE FROM Report;
SET SQL_SAFE_UPDATES = 1;

-- 외래키 제약조건 없이 신고 데이터 추가 (message_id, room_id는 NULL로 설정)
INSERT INTO Report (reporter_id, reported_user_id, report_type, reason, created_at, status, admin_comment) VALUES
(1, 2, 'USER', '부적절한 언행', '2024-01-15 10:30:00', 'PENDING', NULL),
(2, 3, 'USER', '스팸 메시지', '2024-01-16 14:20:00', 'PENDING', NULL),
(3, 4, 'USER', '부적절한 게시글', '2024-01-17 09:15:00', 'RESOLVED', '부적절한 내용으로 판단되어 경고 처리'),
(4, 5, 'USER', '허위 정보', '2024-01-18 16:45:00', 'PENDING', NULL),
(5, 6, 'USER', '욕설 사용', '2024-01-19 11:30:00', 'RESOLVED', '욕설 사용으로 인한 경고'),
(6, 7, 'USER', '광고성 게시글', '2024-01-20 13:20:00', 'PENDING', NULL),
(7, 8, 'USER', '개인정보 유출', '2024-01-21 15:10:00', 'PENDING', NULL),
(8, 9, 'USER', '성희롱 발언', '2024-01-22 12:00:00', 'RESOLVED', '성희롱 발언으로 인한 계정 정지 7일'),
(9, 10, 'USER', '저작권 침해', '2024-01-23 17:30:00', 'PENDING', NULL),
(10, 1, 'USER', '계정 도용', '2024-01-24 08:45:00', 'PENDING', NULL);

-- 신고 데이터 확인
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