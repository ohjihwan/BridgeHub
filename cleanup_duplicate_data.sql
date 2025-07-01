-- 중복된 room_id를 가진 스터디룸 데이터 정리
-- 1. 현재 상태 확인
SELECT '현재 스터디룸 상태:' as info;
SELECT study_room_id, room_id, title, boss_id, created_at FROM studyroom ORDER BY study_room_id DESC;

SELECT '중복된 room_id 확인:' as info;
SELECT room_id, COUNT(*) as count 
FROM studyroom 
GROUP BY room_id 
HAVING COUNT(*) > 1;

-- 2. 중복된 room_id를 가진 스터디룸 삭제 (가장 최근 것만 남기고)
DELETE s1 FROM studyroom s1
INNER JOIN studyroom s2 
WHERE s1.room_id = s2.room_id 
AND s1.study_room_id < s2.study_room_id;

-- 3. 정리 후 상태 확인
SELECT '정리 후 스터디룸 상태:' as info;
SELECT study_room_id, room_id, title, boss_id, created_at FROM studyroom ORDER BY study_room_id DESC;

SELECT '정리 후 중복 확인:' as info;
SELECT room_id, COUNT(*) as count 
FROM studyroom 
GROUP BY room_id 
HAVING COUNT(*) > 1; 