-- 신고 테스트 데이터 생성
USE thebridgehub;

-- 기존 신고 데이터 삭제 (있다면)
DELETE FROM Report WHERE reporter_id IN (SELECT id FROM members WHERE userid LIKE 'test%') OR reported_user_id IN (SELECT id FROM members WHERE userid LIKE 'test%');

-- 신고 테스트 데이터 추가
INSERT INTO Report (reporter_id, reported_user_id, report_type, reason, description, status, created_at) VALUES
(1, 2, 'USER', '부적절한 언행', '상대방이 부적절한 말을 사용했습니다.', 'PENDING', '2024-01-15 10:30:00'),
(2, 3, 'CHAT', '스팸 메시지', '채팅방에서 스팸 메시지를 계속 보냅니다.', 'PENDING', '2024-01-16 14:20:00'),
(3, 4, 'POST', '부적절한 게시글', '게시글이 부적절한 내용을 포함하고 있습니다.', 'RESOLVED', '2024-01-17 09:15:00'),
(4, 5, 'USER', '허위 정보', '프로필에 허위 정보를 기재했습니다.', 'PENDING', '2024-01-18 16:45:00'),
(5, 6, 'CHAT', '욕설 사용', '채팅방에서 욕설을 사용했습니다.', 'RESOLVED', '2024-01-19 11:30:00'),
(6, 7, 'POST', '광고성 게시글', '상업적 광고를 게시했습니다.', 'PENDING', '2024-01-20 13:20:00'),
(7, 8, 'USER', '개인정보 유출', '다른 사용자의 개인정보를 유출했습니다.', 'PENDING', '2024-01-21 15:10:00'),
(8, 9, 'CHAT', '성희롱 발언', '채팅방에서 성희롱 발언을 했습니다.', 'RESOLVED', '2024-01-22 12:00:00'),
(9, 10, 'POST', '저작권 침해', '저작권이 있는 자료를 무단으로 게시했습니다.', 'PENDING', '2024-01-23 17:30:00'),
(10, 1, 'USER', '계정 도용', '다른 사용자의 계정을 도용했습니다.', 'PENDING', '2024-01-24 08:45:00');

-- 신고 데이터 확인
SELECT 
    r.report_id,
    r.report_type,
    r.reason,
    r.status,
    r.created_at,
    CONCAT(m1.nickname, ' (', m1.userid, ')') as reporter,
    CONCAT(m2.nickname, ' (', m2.userid, ')') as reported_user
FROM Report r
JOIN members m1 ON r.reporter_id = m1.id
JOIN members m2 ON r.reported_user_id = m2.id
ORDER BY r.created_at DESC; 