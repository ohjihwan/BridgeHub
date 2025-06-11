BridgeHub - 스터디 매칭 플랫폼
====================

프로젝트 구조
-----------
- api-server: REST API 서버 (포트: 7100)
- socket-server: 실시간 채팅 서버 (포트: 7500)
- front-server: React 프론트엔드 (포트: 5173)

설치 및 실행
----------
1. 필수 요구사항
   - Node.js 18.0.0 이상
   - npm 9.0.0 이상

2. 전체 설치
   ```bash
   npm run install:all
   ```

3. 개발 모드 실행 (모든 서버 동시 실행)
   ```bash
   npm run dev
   ```

4. 프로덕션 모드 실행
   ```bash
   npm start
   ```

개별 서버 실행
------------
1. API 서버
   ```bash
   npm run dev:api
   ```

2. 소켓 서버
   ```bash
   npm run dev:socket
   ```

3. 프론트 서버
   ```bash
   npm run dev:front
   ```

테스트
-----
1. 전체 테스트 실행
   ```bash
   npm run test
   ```

2. 개별 서버 테스트
   ```bash
   npm run test:api
   npm run test:socket
   npm run test:front
   ```

코드 검사
--------
1. 전체 린트 검사
   ```bash
   npm run lint
   ```

2. 개별 서버 린트 검사
   ```bash
   npm run lint:api
   npm run lint:socket
   npm run lint:front
   ```

빌드
----
프론트엔드 빌드
```bash
npm run build
```

테스트 페이지 사용법
----------------
1. API 테스트 (api-test.html)
   - 스터디 생성: 제목, 과목, 장소, 세부 장소, 정원, 설명, 생성자 ID 입력
   - 스터디 목록 조회: 생성된 스터디 목록 확인
   - 스터디 상세 조회: 스터디 ID로 상세 정보 확인
   - 파일 업로드: 스터디 ID, 사용자 ID, 파일 선택 후 업로드
   - 파일 목록 조회: 스터디 ID로 업로드된 파일 목록 확인

2. 채팅 테스트 (chat-test.html)
   - 채팅 참여: 스터디 ID와 사용자 ID 입력 후 참여
   - 메시지 전송: 메시지 입력 후 전송
   - 파일 공유: 파일 선택 후 업로드
   - 파일 다운로드: 파일 목록에서 다운로드 버튼 클릭

환경 변수 설정
------------
1. API 서버 (.env)
   - PORT: 서버 포트 (기본값: 7100)
   - JWT_SECRET: JWT 토큰 비밀키
   - EMAIL_USER: 이메일 발신자 주소
   - EMAIL_PASS: 이메일 발신자 비밀번호

2. 소켓 서버 (.env)
   - PORT: 서버 포트 (기본값: 7500)
   - API_URL: API 서버 URL (기본값: http://localhost:7100)

주의사항
-------
1. 파일 업로드
   - 업로드된 파일은 api-server/uploads/{studyId}/ 디렉토리에 저장
   - 파일 크기 제한: 10MB

2. 채팅
   - 실시간 메시지는 소켓 서버를 통해 전송
   - 메시지 히스토리는 API 서버에 저장

3. 보안
   - .env 파일은 절대 git에 커밋하지 않음
   - JWT_SECRET은 반드시 안전한 값으로 설정

문제 해결
--------
1. 서버 연결 실패
   - 포트 충돌 확인
   - 환경 변수 설정 확인
   - 로그 확인

2. 파일 업로드 실패
   - uploads 디렉토리 권한 확인
   - 파일 크기 제한 확인
   - 디스크 공간 확인

3. 채팅 연결 실패
   - 소켓 서버 실행 상태 확인
   - API 서버 연결 상태 확인
   - 브라우저 콘솔 로그 확인

문의 및 지원
----------
문제 발생 시 다음 정보를 포함하여 문의:
1. 발생한 오류 메시지
2. 실행 환경 (OS, Node.js 버전)
3. 실행 명령어
4. 관련 로그 