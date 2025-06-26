# BridgeHub Socket Server - MongoDB 연동 가이드

## 🚀 MongoDB 연동으로 성능 향상

### 📊 현재 문제점과 해결 방안

#### **기존 문제점**
1. **메모리 기반 저장**: 서버 재시작 시 모든 데이터 손실
2. **확장성 제한**: 단일 서버에서만 동작
3. **데이터 일관성 부족**: Java 서버와 실시간 동기화 어려움
4. **메시지 히스토리 부재**: 과거 대화 내용 접근 불가

#### **MongoDB 연동으로 해결**
1. **영구 저장**: 서버 재시작 후에도 데이터 유지
2. **확장성**: 여러 서버 인스턴스에서 데이터 공유
3. **실시간 동기화**: Java 서버와 MongoDB 간 데이터 일관성
4. **메시지 히스토리**: 과거 대화 내용 조회 가능

## 🏗️ 아키텍처 설계

### **하이브리드 데이터베이스 구조**
```
MySQL (Java Server)     MongoDB (Socket Server)
├── 회원 정보            ├── 실시간 메시지
├── 스터디룸 정보        ├── 채팅 세션
├── 파일 메타데이터      ├── 사용자 상태
└── 시스템 설정          └── 임시 데이터
```

### **MongoDB 컬렉션 구조**

#### 1. **messages** - 실시간 메시지
```javascript
{
  _id: ObjectId,
  studyId: String,           // 스터디룸 ID
  senderId: String,          // 발신자 ID
  senderName: String,        // 발신자 이름
  senderNickname: String,    // 발신자 닉네임
  content: String,           // 메시지 내용
  messageType: String,       // TEXT, FILE, IMAGE, SYSTEM
  fileInfo: Object,          // 파일 정보 (선택)
  timestamp: Date,           // 전송 시간
  createdAt: Date,           // 생성 시간
  updatedAt: Date,           // 수정 시간
  isDeleted: Boolean         // 삭제 여부
}
```

#### 2. **chat_sessions** - 채팅 세션
```javascript
{
  _id: ObjectId,
  studyId: String,           // 스터디룸 ID
  userId: String,            // 사용자 ID
  userName: String,          // 사용자 이름
  userNickname: String,      // 사용자 닉네임
  status: String,            // ACTIVE, INACTIVE, AWAY
  joinedAt: Date,            // 참가 시간
  lastActivity: Date,        // 마지막 활동 시간
  lastMessageAt: Date,       // 마지막 메시지 시간
  messageCount: Number,      // 메시지 수
  socketId: String,          // 소켓 ID
  userAgent: String,         // 사용자 에이전트
  ipAddress: String,         // IP 주소
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. **study_room_status** - 스터디룸 상태
```javascript
{
  _id: ObjectId,
  studyId: String,           // 스터디룸 ID
  studyTitle: String,        // 스터디 제목
  currentMembers: Array,     // 현재 참가자 목록
  memberCount: Number,       // 현재 참가자 수
  lastMessage: Object,       // 마지막 메시지 정보
  lastActivity: Date,        // 마지막 활동 시간
  isActive: Boolean,         // 활성 상태
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. **user_status** - 사용자 상태
```javascript
{
  _id: ObjectId,
  userId: String,            // 사용자 ID
  userName: String,          // 사용자 이름
  userNickname: String,      // 사용자 닉네임
  status: String,            // ONLINE, OFFLINE, AWAY, BUSY
  currentStudyId: String,    // 현재 참가 중인 스터디
  socketId: String,          // 현재 소켓 ID
  lastSeen: Date,            // 마지막 접속 시간
  lastActivity: Date,        // 마지막 활동 시간
  deviceInfo: Object,        // 디바이스 정보
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. **system_logs** - 시스템 로그
```javascript
{
  _id: ObjectId,
  level: String,             // INFO, WARN, ERROR, DEBUG
  category: String,          // CONNECTION, MESSAGE, STUDY, SYSTEM, ERROR
  studyId: String,           // 관련 스터디 ID (선택)
  userId: String,            // 관련 사용자 ID (선택)
  message: String,           // 로그 메시지
  details: Object,           // 상세 정보
  timestamp: Date,           // 발생 시간
  createdAt: Date
}
```

## 🛠️ 설치 및 설정

### **1. MongoDB 설치**
```bash
# Windows
# MongoDB Community Server 다운로드 및 설치
# https://www.mongodb.com/try/download/community

# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb
```

### **2. 의존성 설치**
```bash
cd socket-server
npm install
```

### **3. 환경 변수 설정**
```bash
# env.example을 .env로 복사
cp env.example .env

# .env 파일 편집
MONGODB_URI=mongodb://localhost:27017/bridgehub_socket
```

### **4. MongoDB 서비스 시작**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

## 🚀 실행 방법

### **개발 모드**
```bash
npm run dev
```

### **프로덕션 모드**
```bash
npm start
```

## 📈 성능 최적화

### **인덱스 설정**
- **messages**: `studyId + timestamp`, `senderId + timestamp`
- **chat_sessions**: `studyId`, `userId`, `status`
- **study_room_status**: `studyId`, `lastActivity`
- **user_status**: `userId`, `status`, `lastSeen`
- **system_logs**: `level + timestamp`, `studyId + timestamp`

### **TTL 인덱스 (자동 삭제)**
- **messages**: 30일 후 자동 삭제
- **system_logs**: 90일 후 자동 삭제

### **연결 풀 최적화**
- **Mongoose**: 최대 10개 연결
- **Native MongoDB**: 최대 20개 연결

## 🔧 API 엔드포인트

### **헬스 체크**
```
GET /health/mongodb
```

### **응답 예시**
```json
{
  "status": "healthy",
  "message": "MongoDB 정상 연결"
}
```

## 📊 모니터링 및 로깅

### **시스템 로그 레벨**
- **INFO**: 일반 정보 (연결, 메시지 전송)
- **WARN**: 경고 (연결 실패, 재시도)
- **ERROR**: 오류 (데이터베이스 오류, API 실패)
- **DEBUG**: 디버그 정보 (상세 로그)

### **로그 카테고리**
- **CONNECTION**: 연결 관련 이벤트
- **MESSAGE**: 메시지 전송/수신
- **STUDY**: 스터디룸 참가/퇴장
- **SYSTEM**: 시스템 이벤트
- **ERROR**: 오류 이벤트

## 🔄 데이터 동기화

### **Java 서버와의 동기화**
1. **실시간 메시지**: MongoDB에 즉시 저장 후 Java 서버로 전송
2. **사용자 상태**: MongoDB에서 관리, Java 서버와 주기적 동기화
3. **스터디룸 정보**: Java 서버에서 기본 정보, MongoDB에서 실시간 상태

### **장애 복구**
1. **MongoDB 연결 실패**: 메모리 모드로 전환
2. **Java 서버 연결 실패**: 메시지 큐에 저장 후 재시도
3. **네트워크 오류**: 자동 재연결 및 데이터 복구

## 🧪 테스트

### **연결 테스트**
```bash
# MongoDB 연결 테스트
curl http://localhost:7500/health/mongodb
```

### **메시지 전송 테스트**
```javascript
// WebSocket 클라이언트 테스트
const socket = io('http://localhost:7500');

socket.emit('join-study', { studyId: 'test-room', userId: 'test-user' });
socket.emit('send-message', { 
  studyId: 'test-room', 
  userId: 'test-user', 
  message: 'Hello MongoDB!' 
});
```

## 🔒 보안 고려사항

### **데이터 보호**
- **TTL 인덱스**: 오래된 데이터 자동 삭제
- **인덱스 최적화**: 쿼리 성능 향상
- **연결 풀 관리**: 리소스 효율적 사용

### **접근 제어**
- **JWT 인증**: 모든 소켓 연결 인증
- **IP 제한**: 허용된 IP에서만 접근
- **Rate Limiting**: 메시지 전송 속도 제한

## 📈 성능 향상 효과

### **기존 대비 개선점**
1. **데이터 지속성**: 100% 향상 (메모리 → 영구 저장)
2. **확장성**: 수평 확장 가능 (여러 서버 인스턴스)
3. **메시지 히스토리**: 무제한 저장 및 조회
4. **실시간 통계**: 사용자 활동 분석 가능
5. **장애 복구**: 자동 복구 및 데이터 보존

### **예상 성능 지표**
- **메시지 저장 속도**: < 10ms
- **메시지 조회 속도**: < 50ms (최근 50개)
- **동시 사용자**: 1000명 이상 지원
- **메시지 처리량**: 초당 1000개 이상

## 🚀 다음 단계

### **추가 개선 사항**
1. **Redis 캐싱**: 자주 조회되는 데이터 캐싱
2. **Elasticsearch**: 메시지 검색 기능
3. **실시간 분석**: 사용자 행동 분석
4. **알림 시스템**: 푸시 알림 및 이메일
5. **파일 저장**: 클라우드 스토리지 연동

이제 MongoDB 연동으로 실시간 메시지의 성능과 안정성이 크게 향상됩니다! 🎉 