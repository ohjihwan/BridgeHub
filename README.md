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

# BridgeHub 운영 배포/연동 구조 (2024)

## 서비스별 포트/경로 구조

- React 프론트엔드: https://thebridgehub.org/ (Nginx에서 dist 빌드 서빙)
- Spring Boot API: https://thebridgehub.org/api/ (7100)
- 소켓 서버: https://thebridgehub.org/socket.io/ (7500)
- WebRTC 서버: https://thebridgehub.org/rtc/ (7600, 필요시)
- 관리자 페이지: https://thebridgehub.org/admin/ (7700, 필요시)

## Nginx conf 예시

```nginx
# 1. HTTP → HTTPS 강제 리디렉션
server {
    listen 80;
    server_name thebridgehub.org www.thebridgehub.org;
    return 301 https://$host$request_uri;
}

# 2. HTTPS Nginx 메인 서버
server {
    listen 443 ssl;
    server_name thebridgehub.org www.thebridgehub.org;

    ssl_certificate /etc/letsencrypt/live/thebridgehub.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thebridgehub.org/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # React 정적 파일 (dist)
    location / {
        root /home/ubuntu/BridgeHub/BridgeHub/front-server/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Spring Boot API (7100)
    location /api/ {
        proxy_pass http://localhost:7100/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 소켓 서버 (7500)
    location /socket.io/ {
        proxy_pass http://localhost:7500/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebRTC 서버 (7600, 필요시)
    location /rtc/ {
        proxy_pass http://localhost:7600/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 관리자 페이지 (7700, 필요시)
    location /admin/ {
        proxy_pass http://localhost:7700/;
        allow all;
    }

    # 에러 페이지
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

## React .env 예시

```env
VITE_API_URL=https://thebridgehub.org/api/
VITE_SOCKET_URL=https://thebridgehub.org/socket.io/
VITE_RTC_URL=https://thebridgehub.org/rtc/
VITE_ADMIN_URL=https://thebridgehub.org/admin/
```

## coturn(turnserver.conf) 예시

```conf
listening-port=3478
tls-listening-port=5349
listening-ip=0.0.0.0
relay-ip=0.0.0.0
min-port=49152
max-port=65535
use-auth-secret
static-auth-secret=your_turn_secret
realm=thebridgehub.org
cert=/etc/letsencrypt/live/thebridgehub.org/fullchain.pem
pkey=/etc/letsencrypt/live/thebridgehub.org/privkey.pem
```

---

아래 기존 README 내용은 개발/운영 참고용입니다.

**TheBridgeHub** - 대학생들을 위한 스터디 플랫폼 🌉
