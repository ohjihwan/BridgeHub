-- members 테이블에 status 컬럼 추가
ALTER TABLE members ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';

-- 기존 데이터의 status를 ACTIVE로 설정
UPDATE members SET status = 'ACTIVE' WHERE status IS NULL;

-- status 컬럼에 NOT NULL 제약조건 추가
ALTER TABLE members MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'; 