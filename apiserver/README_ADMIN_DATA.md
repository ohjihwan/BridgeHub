# TheBridgeHub 관리자 페이지 가데이터 사용법

## 개요
이 문서는 TheBridgeHub 관리자 페이지 연동을 위한 가데이터 설정 방법을 설명합니다.

## 파일 구조
```
apiserver/
├── admin_dummy_data.sql    # 관리자 페이지 가데이터 SQL
├── members.sql            # 기존 데이터베이스 스키마
└── README_ADMIN_DATA.md   # 이 파일
```

## 1. 데이터베이스 설정

### 1.1 MySQL 데이터베이스 생성
```sql
CREATE DATABASE IF NOT EXISTS thebridgehub 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 1.2 스키마 적용
```bash
# 기존 스키마 적용
mysql -u [username] -p thebridgehub < members.sql

# 가데이터 적용
mysql -u [username] -p thebridgehub < admin_dummy_data.sql
```

## 2. 가데이터 내용

### 2.1 회원 데이터 (22명)
- **활성 회원**: 20명 (남성 10명, 여성 10명)
- **정지 회원**: 2명
- **다양한 학력**: 고졸(4명), 대학교(12명), 대학원(4명)
- **다양한 전공**: 컴퓨터공학, 전자공학, 기계공학, 경영학, 통계학, 심리학, 건축학, 의학, 영어영문학, 디자인학, 생물학, 국문학, 수학, 화학, 음악학, 간호학 등

### 2.2 채팅방 데이터 (10개)
- 프로그래밍 스터디 A (15명)
- 영어 스터디 B (12명)
- 취미 공유방 (20명)
- 자유게시판 (28명)
- 정보공유방 (25명)
- 취업 준비방 (22명)
- 토익 스터디 (20명)
- 운동 동호회 (18명)
- 독서 모임 (15명)
- 요리 레시피방 (12명)

### 2.3 신고 데이터 (15개)
- **대기중 신고**: 10개
- **처리완료 신고**: 5개
- **다양한 신고 사유**: 욕설, 스팸, 부적절한 콘텐츠, 괴롭힘, 저작권 침해, 음란물, 사기, 도배, 개인정보 유출, 폭력적 발언

### 2.4 스터디룸 데이터 (5개)
- Java 프로그래밍 스터디
- 영어 회화 스터디
- 취미 공유 스터디
- 정보 공유 스터디
- 취업 준비 스터디

### 2.5 메시지 데이터
- 활동량 측정을 위한 메시지 데이터
- 각 회원별 다양한 활동 패턴

## 3. 관리자 페이지 기능

### 3.1 통계 페이지
- **회원 통계**: 성별, 학력, 활동시간대, 전공별 분포
- **신고 통계**: 최근 신고 현황, 신고 타입별 통계
- **활동 통계**: 분기별 가입자/접속자, 활동 TOP 10, 인기 채팅방 TOP 10

### 3.2 회원 관리 페이지
- **회원 목록**: 페이징, 검색, 필터링
- **회원 상태 관리**: 활성화/정지
- **회원 정보 조회**: 상세 정보 표시

### 3.3 신고 관리 페이지
- **신고 목록**: 페이징, 검색, 상태별 필터링
- **신고 처리**: 상세 보기, 처리 완료
- **일괄 처리**: 선택된 신고들 일괄 처리

## 4. 백엔드 연동

### 4.1 API 엔드포인트
```
GET    /api/admin/statistics     # 통계 조회
GET    /api/admin/users          # 회원 목록 조회
PATCH  /api/admin/users/{id}/status  # 회원 상태 변경
GET    /api/admin/reports        # 신고 목록 조회
POST   /api/admin/reports/{id}/resolve  # 신고 처리
```

### 4.2 프론트엔드 연동
- **백엔드 서버 실행 시**: 실제 API 호출
- **백엔드 서버 미실행 시**: 목 데이터 사용 (자동 전환)

## 5. 테스트 계정

### 5.1 관리자 로그인
- **아이디**: admin
- **비밀번호**: admin1234

### 5.2 테스트 회원들
- **김민우**: kim.minwoo@email.com (활동량 120회)
- **이지환**: lee.jihwan@email.com (활동량 110회)
- **박성민**: park.sungmin@email.com (활동량 100회)
- 기타 19명의 테스트 회원

## 6. 실행 방법

### 6.1 백엔드 서버 실행
```bash
cd apiserver
./gradlew bootRun
```

### 6.2 관리자 프론트엔드 실행
```bash
cd front-admin
npm install
npm run dev
```

### 6.3 접속
- **관리자 페이지**: http://localhost:7701
- **백엔드 API**: http://localhost:8080

## 7. 주의사항

### 7.1 데이터베이스 연결
- MySQL 서버가 실행 중이어야 합니다
- 데이터베이스 연결 정보가 `application.properties`에 올바르게 설정되어야 합니다

### 7.2 가데이터 중복 실행 방지
- 가데이터는 한 번만 실행해야 합니다
- 중복 실행 시 외래키 제약조건 오류가 발생할 수 있습니다

### 7.3 백엔드 서버 상태
- 백엔드 서버가 실행되지 않아도 프론트엔드는 목 데이터로 정상 작동합니다
- 실제 데이터 연동을 위해서는 백엔드 서버가 실행되어야 합니다

## 8. 문제 해결

### 8.1 데이터베이스 연결 오류
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 서비스 시작
sudo systemctl start mysql
```

### 8.2 가데이터 실행 오류
```bash
# 기존 데이터 삭제 후 재실행
mysql -u [username] -p thebridgehub -e "DROP DATABASE thebridgehub; CREATE DATABASE thebridgehub;"
mysql -u [username] -p thebridgehub < members.sql
mysql -u [username] -p thebridgehub < admin_dummy_data.sql
```

### 8.3 프론트엔드 실행 오류
```bash
# 의존성 재설치
cd front-admin
rm -rf node_modules package-lock.json
npm install
```

## 9. 추가 개발

### 9.1 새로운 가데이터 추가
1. `admin_dummy_data.sql` 파일에 INSERT 문 추가
2. 데이터베이스에 적용
3. 프론트엔드에서 새로운 데이터 확인

### 9.2 API 확장
1. `AdminController.java`에 새로운 엔드포인트 추가
2. 프론트엔드 API 서비스에 함수 추가
3. 컴포넌트에서 새로운 API 호출

이 문서를 참고하여 관리자 페이지의 가데이터를 설정하고 테스트할 수 있습니다. 