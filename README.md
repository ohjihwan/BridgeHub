# 🌉 TheBridgeHub

대학생들을 위한 스터디 매칭 및 실시간 채팅 플랫폼

## 📋 프로젝트 개요

TheBridgeHub는 대학생들이 스터디 그룹을 만들고, 실시간으로 소통할 수 있는 웹 플랫폼입니다. 스터디룸 생성, 멤버 관리, 실시간 채팅, 파일 공유 등의 기능을 제공합니다.

## 🚀 주요 기능

### 👥 회원 관리
- 회원가입/로그인 (JWT 인증)
- 이메일 인증
- 프로필 관리
- 관리자 대시보드

### 📚 스터디룸 관리
- 스터디룸 생성/수정/삭제
- 스터디룸 검색 및 필터링
- 멤버 참가/탈퇴
- 스터디룸 상세 정보

### 💬 실시간 채팅
- 스터디룸별 실시간 채팅
- 파일 업로드/다운로드
- 채팅 히스토리
- 타이핑 인디케이터
- 링크 미리보기

### 📁 파일 관리
- 다중 파일 업로드
- 드래그 앤 드롭 지원
- 파일 미리보기
- 스터디룸별 파일 관리

### 🚨 신고 시스템
- 사용자/메시지/스터디룸 신고
- 신고 관리 및 처리

## 🏗️ 기술 스택

### Backend
- **Java 17**
- **Spring Boot 3.x**
- **Spring Security**
- **MyBatis**
- **MySQL 8.0**
- **JWT Authentication**

### Frontend
- **React 18**
- **Vite**
- **Socket.IO Client**
- **Axios**

### Real-time Communication
- **Socket.IO Server (Node.js)**
- **Express.js**

### Database
- **MySQL 8.0**

## 📁 프로젝트 구조

```
thebridgehub/
├── src/                    # Spring Boot 백엔드
│   ├── main/
│   │   ├── java/
│   │   │   └── com/bridgehub/
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── mapper/
│   │   │       ├── model/
│   │   │       └── config/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── mapper/
├── front-server/           # React 프론트엔드
│   ├── src/
│   ├── public/
│   └── package.json
├── front-admin/            # React 관리자 대시보드
│   ├── src/
│   ├── public/
│   └── package.json
├── socket-server/          # Socket.IO 실시간 서버
│   ├── src/
│   ├── index.js
│   └── package.json
├── uploads/               # 업로드된 파일 저장소
├── logs/                  # 로그 파일
└── docs/                  # 문서
```

## 🛠️ 설치 및 실행

### 1. 환경 요구사항
- Java 17+
- Node.js 18+
- MySQL 8.0+
- npm 또는 yarn

### 2. 데이터베이스 설정
```sql
-- MySQL 데이터베이스 생성
CREATE DATABASE bridgehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. 환경 변수 설정
```bash
# .env 파일 생성 (각 서버별로)
cp .env.example .env
```

### 4. 백엔드 서버 실행
```bash
# Spring Boot 서버 (포트: 7100)
./gradlew bootRun
```

### 5. 프론트엔드 서버 실행
```bash
# 메인 프론트엔드 (포트: 7000)
cd front-server
npm install
npm run dev

# 관리자 대시보드 (포트: 7700)
cd front-admin
npm install
npm run dev
```

### 6. 소켓 서버 실행
```bash
# Socket.IO 서버 (포트: 7500)
cd socket-server
npm install
npm start
```

## 🔧 환경 변수

### Spring Boot (.env)
```env
# 데이터베이스
DB_URL=jdbc:mysql://localhost:3306/bridgehub
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# 파일 업로드
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Socket.IO Server (.env)
```env
# 서버 설정
PORT=7500
API_BASE_URL=http://localhost:7100/api

# CORS 설정
CORS_ORIGINS=http://localhost:7000,http://localhost:7700

# JWT
JWT_SECRET=your_jwt_secret_key
```

## 📊 API 문서

### 인증 API
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃

### 스터디룸 API
- `GET /api/studies` - 스터디룸 목록
- `POST /api/studies` - 스터디룸 생성
- `GET /api/studies/{id}` - 스터디룸 상세
- `POST /api/studies/{id}/join` - 스터디룸 참가
- `DELETE /api/studies/{id}/leave` - 스터디룸 탈퇴

### 채팅 API
- `GET /api/messages/history/{studyId}` - 채팅 히스토리
- `POST /api/messages` - 메시지 전송

### 파일 API
- `POST /api/files/upload` - 파일 업로드
- `GET /api/files/download/{fileId}` - 파일 다운로드
- `GET /api/files/studyroom/{studyId}` - 스터디룸 파일 목록

## 🧪 테스트

### HTML 테스트 페이지
프로젝트 루트에 여러 테스트 HTML 파일이 포함되어 있습니다:

- `test-member-features.html` - 회원 관리 기능 테스트
- `test-study-chat-features.html` - 스터디룸 및 채팅 기능 테스트
- `test-chat-integration.html` - 통합 채팅 테스트

### API 테스트
```bash
# 스터디룸 목록 조회
curl -X GET http://localhost:7100/api/studies

# 회원가입
curl -X POST http://localhost:7100/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password123","nickname":"테스트"}'
```

## 🔒 보안

- JWT 기반 인증
- Spring Security 설정
- CORS 설정
- 파일 업로드 보안
- SQL Injection 방지

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

## 🚀 배포

### 개발 환경
- Spring Boot: `http://localhost:7100`
- React Frontend: `http://localhost:7000`
- React Admin: `http://localhost:7700`
- Socket.IO: `http://localhost:7500`

### 프로덕션 환경
환경 변수를 적절히 설정하여 배포하세요.

---

**TheBridgeHub** - 대학생들을 위한 스터디 플랫폼 🌉 