-- 중복된 스터디룸 데이터 확인 및 정리
-- 1. 현재 스터디룸 테이블 상태 확인
SELECT * FROM studyroom ORDER BY study_room_id DESC;

-- 2. room_id 중복 확인
SELECT room_id, COUNT(*) as count 
FROM studyroom 
GROUP BY room_id 
HAVING COUNT(*) > 1;

-- 3. 채팅방 테이블 상태 확인
SELECT * FROM ChatRoom ORDER BY room_id DESC;

-- 4. 중복된 room_id를 가진 스터디룸 삭제 (가장 최근 것만 남기고)
DELETE s1 FROM studyroom s1
INNER JOIN studyroom s2 
WHERE s1.room_id = s2.room_id 
AND s1.study_room_id < s2.study_room_id;

-- 5. 삭제 후 상태 확인
SELECT * FROM studyroom ORDER BY study_room_id DESC; 