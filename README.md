# 🌉 BridgeHub 웹 애플리케이션

> BridgeHub는 스터디 매칭 플랫폼입니다. Spring Boot 백엔드와 React 프론트엔드를 활용한 풀스택 웹 애플리케이션으로, 스터디룸 생성, 실시간 채팅, 게시판, 화상 통화 등 다양한 기능을 제공합니다.

---

## 📚 프로젝트 개요

이 프로젝트는 스터디 매칭 플랫폼 BridgeHub입니다. 사용자들이 스터디룸을 생성하고 참여하며, 실시간 채팅과 화상 통화를 통해 소통할 수 있는 웹 애플리케이션입니다. Spring Boot 기반의 RESTful API 서버, React 기반의 프론트엔드, Socket.io 기반의 실시간 통신 서버, WebRTC 기반의 화상 통화 서버로 구성되어 있습니다.

---

## 📘 주요 기능

### 1. 사용자 인증 (Authentication)
- **회원가입**: 이메일, 비밀번호, 이름, 닉네임, 전화번호 등 정보 입력
- **로그인**: JWT 토큰 기반 인증 시스템
- **이메일 인증**: 회원가입 전 이메일 인증 코드 발송 및 검증
- **비밀번호 찾기/재설정**: 이메일을 통한 비밀번호 재설정
- **비밀번호 암호화**: bcrypt를 사용한 안전한 비밀번호 저장
- **로그인 유지**: 토큰 기반 세션 관리

### 2. 스터디룸 관리 (Study Room)
- **스터디룸 생성**: 제목, 설명, 지역, 과목, 시간대 등 설정
- **스터디룸 검색**: 지역, 과목, 시간대 등 조건별 검색
- **스터디룸 참여**: 스터디룸 가입 및 멤버 관리
- **스터디룸 목록**: 페이징 및 정렬 기능

### 3. 실시간 채팅 (Chat)
- **채팅방 생성**: 스터디룸별 채팅방 자동 생성
- **실시간 메시지**: Socket.io를 활용한 실시간 메시지 송수신
- **채팅 로그 저장**: MongoDB에 채팅 내역 저장
- **멤버 관리**: 채팅방 멤버 초대 및 관리

### 4. 게시판 (Board)
- **게시글 작성**: 카테고리별 게시글 작성 및 첨부파일 업로드
- **게시글 조회**: 게시글 목록 및 상세 보기
- **게시글 관리**: 게시글 수정 및 삭제
- **댓글 시스템**: 게시글에 대한 댓글 작성 및 좋아요
- **좋아요 기능**: 게시글 및 댓글 좋아요
- **카테고리**: 자유게시판, 질문/답변, 정보공유, 공지사항

### 5. 화상 통화 (WebRTC)
- **화상 통화**: WebRTC를 활용한 화상 통화 기능
- **실시간 통신**: Socket.io를 통한 시그널링

### 6. 파일 관리 (File Upload)
- **프로필 이미지**: 사용자 프로필 이미지 업로드
- **스터디 썸네일**: 스터디룸 썸네일 이미지 업로드
- **게시판 첨부파일**: 게시글 첨부파일 업로드 및 다운로드

### 7. 관리자 기능 (Admin)
- **회원 관리**: 회원 목록 조회 및 관리
- **신고 관리**: 신고 내역 조회 및 처리
- **통계 대시보드**: 사용자 통계 및 활동 내역

---

## 📁 프로젝트 구조

```
BridgeHub/
├── apiserver/                    # Spring Boot 백엔드 API 서버
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/koreait/apiserver/
│   │   │   │       ├── config/           # 설정 클래스
│   │   │   │       ├── controller/       # REST 컨트롤러
│   │   │   │       ├── service/          # 비즈니스 로직
│   │   │   │       ├── repository/       # 데이터 접근 계층
│   │   │   │       ├── entity/           # 엔티티 클래스
│   │   │   │       ├── dto/              # 데이터 전송 객체
│   │   │   │       └── security/          # 보안 설정
│   │   │   └── resources/
│   │   │       ├── application.yml       # Spring 설정
│   │   │       └── mapper/               # MyBatis 매퍼 XML
│   │   └── test/                         # 테스트 코드
│   ├── build.gradle                      # Gradle 빌드 설정
│   └── gradlew                           # Gradle Wrapper
│
├── front-server/                  # React 메인 프론트엔드
│   ├── src/
│   │   ├── page/                 # 페이지 컴포넌트
│   │   │   ├── home.jsx          # 홈 페이지
│   │   │   ├── login.jsx         # 로그인 페이지
│   │   │   ├── signup.jsx        # 회원가입 페이지
│   │   │   ├── mypage.jsx        # 마이페이지
│   │   │   ├── chat.jsx          # 채팅 페이지
│   │   │   ├── board.jsx         # 게시판 페이지
│   │   │   └── list.jsx          # 스터디룸 목록
│   │   ├── components/           # 재사용 컴포넌트
│   │   ├── assets/               # 정적 리소스
│   │   └── main.jsx              # 진입점
│   ├── package.json              # npm 패키지 설정
│   └── vite.config.js            # Vite 설정
│
├── front-admin/                   # React 관리자 페이지
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Login.jsx     # 관리자 로그인
│   │   │   │   ├── AdminDashboard.jsx  # 대시보드
│   │   │   │   ├── MemberManage.jsx    # 회원 관리
│   │   │   │   ├── ReportManage.jsx    # 신고 관리
│   │   │   │   └── Statistics.jsx       # 통계
│   │   ├── components/           # 컴포넌트
│   │   └── services/             # API 서비스
│   ├── package.json
│   └── vite.config.js
│
├── socket-server/                 # Socket.io 실시간 통신 서버
│   ├── src/
│   │   ├── controllers/          # 컨트롤러
│   │   ├── services/             # 서비스 로직
│   │   ├── middleware/           # 미들웨어
│   │   └── socket/               # Socket 핸들러
│   ├── index.js                  # 서버 진입점
│   └── package.json
│
├── rtc-server/                    # WebRTC 화상 통화 서버
│   ├── server.js                 # 서버 진입점
│   ├── src/
│   │   └── server.mjs            # 서버 로직
│   └── package.json
│
├── env.example                    # 환경 변수 예시 파일
├── package.json                   # 루트 패키지 설정
└── README.md                      # 프로젝트 설명서
```

---

## ⚙️ 실행 환경 설정

### 1️⃣ 필수 요구사항

- **Java**: JDK 17 이상
- **Node.js**: v18 이상
- **npm**: v9 이상
- **MySQL**: MySQL 8.0 이상
- **MongoDB**: MongoDB 4.4 이상 (로컬 또는 Atlas)
- **Gradle**: 7.0 이상 (Gradle Wrapper 포함)

### 2️⃣ 프로젝트 클론 및 의존성 설치

```bash
# 프로젝트 디렉토리로 이동
cd BridgeHub

# 루트 디렉토리에서 모든 서브 프로젝트 의존성 설치
npm run install:all
```

또는 개별 설치:

```bash
# 루트 디렉토리 의존성 설치
npm install

# 각 서브 프로젝트 의존성 설치
cd front-server && npm install && cd ..
cd front-admin && npm install && cd ..
cd socket-server && npm install && cd ..
cd rtc-server && npm install && cd ..

# Spring Boot 프로젝트 의존성 설치 (apiserver 디렉토리에서)
cd apiserver
./gradlew build
cd ..
```

### 3️⃣ 데이터베이스 설정

#### MySQL 설정

1. MySQL 서버 실행
2. 데이터베이스 생성:

```sql
CREATE DATABASE thebridgehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. SQL 스크립트 실행 (선택사항):

```bash
# 테스트 데이터가 포함된 SQL 파일 실행
mysql -u root -p thebridgehub < apiserver/members.sql
```

#### MongoDB 설정

**로컬 MongoDB 사용:**

1. MongoDB 서버 실행
2. `application.yml`에서 MongoDB URI 설정:
   ```yaml
   spring:
     data:
       mongodb:
         uri: mongodb://localhost:27017/thebridgehub
   ```

**MongoDB Atlas 사용 (클라우드):**

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)에서 계정 생성
2. 클러스터 생성 및 데이터베이스 사용자 생성
3. 네트워크 액세스 설정 (IP 화이트리스트)
4. 연결 문자열을 `application.yml`에 설정:
   ```yaml
   spring:
     data:
       mongodb:
         uri: mongodb+srv://username:password@cluster.mongodb.net/thebridgehub
   ```

### 4️⃣ 환경 변수 설정

#### Spring Boot 백엔드 설정

`apiserver/src/main/resources/application.yml` 파일을 수정합니다:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/thebridgehub?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: your_db_username
    password: your_db_password
  
  data:
    mongodb:
      uri: mongodb://localhost:27017/thebridgehub
      # 또는 MongoDB Atlas 사용 시
      # uri: mongodb+srv://username:password@cluster.mongodb.net/thebridgehub

  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password

jwt:
  secret: your-jwt-secret-key-here
  expiration: 86400000  # 24시간 (밀리초)

server:
  port: 7100
```

#### Socket 서버 설정

프로젝트 루트에 `socket-server/.env` 파일을 생성합니다:

```env
# 서버 설정
PORT=7500
NODE_ENV=development

# CORS 설정
CORS_ORIGINS=http://localhost:7000,http://localhost:7700

# Java Backend API 설정
API_BASE_URL=http://localhost:7100/api

# MongoDB 설정
MONGODB_URI=mongodb://localhost:27017/bridgehub_socket
# 또는 MongoDB Atlas 사용 시
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bridgehub_socket

# JWT 설정 (Spring Boot와 동일한 시크릿 사용)
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=24h
```

#### 프론트엔드 설정

`front-server/vite.config.js` 또는 환경 변수로 API URL 설정:

```bash
# .env 파일 생성 (선택사항)
VITE_API_TARGET=http://localhost:7100
```

### 5️⃣ 애플리케이션 실행

#### 전체 서버 실행 (개발 모드)

프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다:

```bash
# 모든 서버를 동시에 실행 (개발 모드)
npm run dev
```

이 명령어는 다음 서버들을 동시에 실행합니다:
- **프론트엔드**: http://localhost:7000
- **관리자 페이지**: http://localhost:7700
- **Socket 서버**: http://localhost:7500
- **RTC 서버**: http://localhost:3000 (또는 설정된 포트)

#### 개별 서버 실행

**Spring Boot API 서버 실행:**

```bash
cd apiserver
./gradlew bootRun
# 또는
./gradlew build && java -jar build/libs/apiserver-0.0.1-SNAPSHOT.jar
```

API 서버는 **http://localhost:7100**에서 실행됩니다.

**프론트엔드 실행:**

```bash
cd front-server
npm run dev
```

프론트엔드는 **http://localhost:7000**에서 실행됩니다.

**관리자 페이지 실행:**

```bash
cd front-admin
npm run dev
```

관리자 페이지는 **http://localhost:7700**에서 실행됩니다.

**Socket 서버 실행:**

```bash
cd socket-server
npm run dev
```

Socket 서버는 **http://localhost:7500**에서 실행됩니다.

**RTC 서버 실행:**

```bash
cd rtc-server
npm run dev
```

RTC 서버는 설정된 포트에서 실행됩니다.

#### 프로덕션 모드 실행

```bash
# 프론트엔드 빌드
cd front-server
npm run build

# Spring Boot 빌드
cd apiserver
./gradlew build

# 프로덕션 모드로 서버 실행
cd socket-server
npm run prod
```

### 6️⃣ 서버 접속 확인

서버가 정상적으로 실행되면 다음 주소로 접속할 수 있습니다:

- **메인 페이지**: http://localhost:7000
- **관리자 페이지**: http://localhost:7700
- **API 엔드포인트**: http://localhost:7100/api
- **Socket 서버**: http://localhost:7500

**서버 상태 확인:**

```bash
# API 서버 상태 확인
curl http://localhost:7100/api/health

# Socket 서버 상태 확인
curl http://localhost:7500/health
```

---

## 📦 주요 패키지 및 기술 스택

### 백엔드 (Spring Boot)
- **Spring Boot**: 웹 애플리케이션 프레임워크
- **Spring Security**: 인증 및 보안
- **MyBatis**: SQL 매퍼 프레임워크
- **JWT**: 토큰 기반 인증
- **MySQL**: 관계형 데이터베이스
- **MongoDB**: NoSQL 데이터베이스 (채팅 로그 저장)
- **Spring Mail**: 이메일 발송

### 프론트엔드 (React)
- **React**: UI 라이브러리
- **React Router**: 라우팅
- **Vite**: 빌드 도구
- **Axios**: HTTP 클라이언트
- **Socket.io Client**: 실시간 통신
- **SCSS**: 스타일링

### 실시간 통신
- **Socket.io**: 실시간 양방향 통신
- **Express**: Node.js 웹 프레임워크
- **MongoDB**: 채팅 메시지 저장

### 화상 통화
- **WebRTC**: 실시간 미디어 통신
- **Socket.io**: 시그널링

### 개발 도구
- **Gradle**: Java 빌드 도구
- **Nodemon**: Node.js 자동 재시작
- **Concurrently**: 동시 실행 도구

---

## 💡 핵심 개념

### JWT (JSON Web Token)
사용자 인증 정보를 안전하게 전달하기 위한 토큰 기반 인증 방식입니다. 서버에서 토큰을 발급하고, 클라이언트는 이후 요청 시 토큰을 포함하여 인증된 사용자임을 증명합니다.

### Socket.io
실시간 양방향 통신을 위한 라이브러리입니다. 서버와 클라이언트 간 실시간 메시지 송수신을 지원하며, 채팅 기능에 활용됩니다.

### WebRTC
브라우저 간 실시간 미디어 통신을 위한 기술입니다. 별도의 플러그인 없이 브라우저에서 화상 통화를 제공합니다.

### RESTful API
HTTP 메서드(GET, POST, PUT, DELETE)를 사용하여 리소스를 관리하는 API 설계 방식입니다.

### MyBatis
Java에서 SQL 매퍼를 사용하여 데이터베이스와 상호작용하는 프레임워크입니다.

---

## 🔗 주요 API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/send-verification` - 이메일 인증 코드 발송
- `POST /api/auth/verify-email` - 이메일 인증 코드 확인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보 조회
- `POST /api/auth/find-password` - 비밀번호 찾기
- `POST /api/auth/reset-password` - 비밀번호 재설정

### 스터디룸 (Study Room)
- `GET /api/study-rooms` - 스터디룸 목록 조회
- `POST /api/study-rooms` - 스터디룸 생성
- `GET /api/study-rooms/:id` - 스터디룸 상세 조회
- `PUT /api/study-rooms/:id` - 스터디룸 수정
- `DELETE /api/study-rooms/:id` - 스터디룸 삭제
- `POST /api/study-rooms/:id/join` - 스터디룸 참여

### 게시판 (Board)
- `GET /api/boards` - 게시글 목록 조회
- `POST /api/boards` - 게시글 작성
- `GET /api/boards/:id` - 게시글 상세 조회
- `PUT /api/boards/:id` - 게시글 수정
- `DELETE /api/boards/:id` - 게시글 삭제
- `POST /api/boards/:id/like` - 게시글 좋아요
- `POST /api/boards/:id/comments` - 댓글 작성
- `POST /api/comments/:id/like` - 댓글 좋아요

### 파일 (File)
- `POST /api/files/upload` - 파일 업로드
- `GET /api/files/:id` - 파일 다운로드

### 관리자 (Admin)
- `GET /api/admin/members` - 회원 목록 조회
- `GET /api/admin/reports` - 신고 목록 조회
- `PUT /api/admin/reports/:id` - 신고 처리

자세한 API 명세는 `BridgeHub_API_명세서.txt` 파일을 참고하세요.

---

## 🔗 참고 자료

### Spring Boot
- [Spring Boot 공식 문서](https://spring.io/projects/spring-boot)
- [Spring Security 공식 문서](https://spring.io/projects/spring-security)

### React
- [React 공식 문서](https://react.dev/)
- [Vite 공식 문서](https://vitejs.dev/)

### Socket.io
- [Socket.io 공식 문서](https://socket.io/docs/)

### WebRTC
- [WebRTC 공식 문서](https://webrtc.org/)

### 데이터베이스
- [MySQL 공식 문서](https://dev.mysql.com/doc/)
- [MongoDB 공식 문서](https://www.mongodb.com/docs/)

---

## 📝 라이선스

이 프로젝트는 학습 목적으로 작성되었습니다.

---

## 👤 프로젝트 참여자

- **오지환 - 프론트엔드, 디자인, 기획**: 프로젝트의 프론트엔드 개발, UI/UX 디자인, 서비스 기획을 담당했습니다.

---

## ⚠️ 주의사항

1. **환경 변수 보안**: `.env` 파일과 `application.yml` 파일에 포함된 민감한 정보는 절대 Git에 커밋하지 마세요. `.gitignore`에 추가되어 있는지 확인하세요.
2. **데이터베이스 연결**: MySQL과 MongoDB 서버가 실행 중인지 확인하세요.
3. **포트 충돌**: 다른 애플리케이션이 사용 중인 포트(7100, 7000, 7700, 7500 등)가 있으면 설정을 변경하세요.
4. **이메일 설정**: 이메일 인증 기능을 사용하려면 Gmail 앱 비밀번호가 필요합니다.
5. **JWT 시크릿**: 프로덕션 환경에서는 반드시 강력한 JWT 시크릿 키를 사용하세요.
6. **CORS 설정**: 프로덕션 환경에서는 CORS 설정을 적절히 제한하세요.

---

## 🚀 빠른 시작 가이드

1. **프로젝트 클론**
   ```bash
   git clone https://github.com/ohjihwan/BridgeHub.git
   cd BridgeHub
   ```

2. **의존성 설치**
   ```bash
   npm run install:all
   ```

3. **데이터베이스 설정**
   - MySQL 데이터베이스 생성
   - MongoDB 서버 실행 또는 Atlas 연결 설정

4. **환경 변수 설정**
   - `apiserver/src/main/resources/application.yml` 수정
   - `socket-server/.env` 파일 생성

5. **서버 실행**
   ```bash
   # 개발 모드 (모든 서버 동시 실행)
   npm run dev
   
   # 또는 개별 실행
   # 터미널 1: API 서버
   cd apiserver && ./gradlew bootRun
   
   # 터미널 2: 프론트엔드
   cd front-server && npm run dev
   
   # 터미널 3: Socket 서버
   cd socket-server && npm run dev
   ```

6. **브라우저에서 접속**
   - 메인 페이지: http://localhost:7000
   - 관리자 페이지: http://localhost:7700

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해 주세요.
