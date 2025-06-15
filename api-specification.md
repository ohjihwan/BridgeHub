# BridgeHub API 명세서

## 기본 정보
- 기본 URL: `http://localhost:7100`
- 인증 방식: JWT (Bearer Token)
- 응답 형식: JSON

## 공통 응답 형식
```json
{
  "success": true/false,
  "data": {}, // 성공 시 데이터
  "error": "에러 메시지" // 실패 시 에러 메시지
}
```

## 1. 이메일 인증 API

### 1.1 인증 코드 전송
- **URL**: `/api/email/send-verification`
- **Method**: `POST`
- **Description**: 이메일 인증 코드를 전송합니다.
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "인증 코드가 이메일로 전송되었습니다."
    }
  }
  ```

### 1.2 인증 코드 확인
- **URL**: `/api/email/verify-code`
- **Method**: `POST`
- **Description**: 이메일 인증 코드를 확인하고 JWT 토큰을 발급합니다.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "JWT_TOKEN",
      "expiresIn": 3600
    }
  }
  ```

## 2. 스터디 관리 API

### 2.1 스터디 생성
- **URL**: `/api/study/create`
- **Method**: `POST`
- **Description**: 새로운 스터디를 생성합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "title": "스터디 제목",
    "subject": "과목",
    "location": "장소",
    "detailLocation": "세부 장소",
    "maxMembers": 5,
    "description": "스터디 설명"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "studyId": "uuid",
      "title": "스터디 제목",
      "createdAt": "2024-02-20T12:00:00Z"
    }
  }
  ```

### 2.2 스터디 목록 조회
- **URL**: `/api/study/list`
- **Method**: `GET`
- **Description**: 스터디 목록을 조회합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "studies": [
        {
          "studyId": "uuid",
          "title": "스터디 제목",
          "subject": "과목",
          "location": "장소",
          "currentMembers": 3,
          "maxMembers": 5,
          "createdAt": "2024-02-20T12:00:00Z"
        }
      ]
    }
  }
  ```

### 2.3 스터디 상세 조회
- **URL**: `/api/study/:studyId`
- **Method**: `GET`
- **Description**: 특정 스터디의 상세 정보를 조회합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "studyId": "uuid",
      "title": "스터디 제목",
      "subject": "과목",
      "location": "장소",
      "detailLocation": "세부 장소",
      "currentMembers": 3,
      "maxMembers": 5,
      "description": "스터디 설명",
      "createdAt": "2024-02-20T12:00:00Z",
      "members": [
        {
          "userId": "uuid",
          "name": "사용자 이름",
          "joinedAt": "2024-02-20T12:00:00Z"
        }
      ]
    }
  }
  ```

### 2.4 스터디 참여
- **URL**: `/api/study/:studyId/join`
- **Method**: `POST`
- **Description**: 스터디에 참여합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "스터디 참여가 완료되었습니다."
    }
  }
  ```

### 2.5 스터디 탈퇴
- **URL**: `/api/study/:studyId/leave`
- **Method**: `POST`
- **Description**: 스터디에서 탈퇴합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "스터디 탈퇴가 완료되었습니다."
    }
  }
  ```

## 3. 파일 관리 API

### 3.1 파일 업로드
- **URL**: `/api/study/:studyId/files/upload`
- **Method**: `POST`
- **Description**: 스터디에 파일을 업로드합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **Request Body**:
  - `file`: 파일 데이터
  - `userId`: 사용자 ID
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "fileId": "uuid",
      "fileName": "파일명",
      "fileSize": 1024,
      "fileType": "image/jpeg",
      "url": "/uploads/studyId/filename"
    }
  }
  ```

### 3.2 파일 목록 조회
- **URL**: `/api/study/:studyId/files/list`
- **Method**: `GET`
- **Description**: 스터디의 파일 목록을 조회합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "files": [
        {
          "fileId": "uuid",
          "fileName": "파일명",
          "fileSize": 1024,
          "fileType": "image/jpeg",
          "uploadedBy": "사용자 이름",
          "uploadedAt": "2024-02-20T12:00:00Z",
          "url": "/uploads/studyId/filename"
        }
      ]
    }
  }
  ```

### 3.3 파일 다운로드
- **URL**: `/api/study/:studyId/files/:filename`
- **Method**: `GET`
- **Description**: 파일을 다운로드합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**: 파일 데이터 (Binary)

### 3.4 파일 미리보기
- **URL**: `/api/study/:studyId/files/:filename/preview`
- **Method**: `GET`
- **Description**: 이미지 파일의 미리보기를 제공합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**: 이미지 데이터 (Binary)

### 3.5 파일 삭제
- **URL**: `/api/study/:studyId/files/:filename`
- **Method**: `DELETE`
- **Description**: 파일을 삭제합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "message": "파일이 삭제되었습니다."
    }
  }
  ```

## 4. 채팅 메시지 API

### 4.1 메시지 저장
- **URL**: `/api/study/:studyId/messages`
- **Method**: `POST`
- **Description**: 채팅 메시지를 저장합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "userId": "uuid",
    "message": "메시지 내용",
    "fileType": "image/file",
    "fileUrl": "파일 URL",
    "fileName": "파일명"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "messageId": "uuid",
      "createdAt": "2024-02-20T12:00:00Z"
    }
  }
  ```

### 4.2 메시지 조회
- **URL**: `/api/study/:studyId/messages`
- **Method**: `GET`
- **Description**: 채팅 메시지 목록을 조회합니다.
- **Headers**:
  - `Authorization: Bearer {token}`
- **Query Parameters**:
  - `limit`: 페이지당 메시지 수 (기본값: 50)
  - `before`: 특정 시간 이전의 메시지 조회
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "messages": [
        {
          "messageId": "uuid",
          "userId": "uuid",
          "userName": "사용자 이름",
          "message": "메시지 내용",
          "fileType": "image/file",
          "fileUrl": "파일 URL",
          "fileName": "파일명",
          "createdAt": "2024-02-20T12:00:00Z"
        }
      ],
      "hasMore": true/false
    }
  }
  ```

## 5. 에러 코드

### 5.1 공통 에러 코드
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 에러

### 5.2 비즈니스 에러 코드
- `1001`: 이메일 인증 코드 만료
- `1002`: 잘못된 인증 코드
- `2001`: 스터디 정원 초과
- `2002`: 이미 참여 중인 스터디
- `3001`: 파일 크기 초과
- `3002`: 지원하지 않는 파일 형식
- `4001`: 메시지 전송 실패

## 6. 제한 사항

### 6.1 파일 업로드
- 최대 파일 크기: 10MB
- 지원 파일 형식:
  - 이미지: jpg, jpeg, png, gif
  - 문서: pdf, doc, docx
  - 기타 파일

### 6.2 API 요청 제한
- 인증 코드 전송: 1분당 3회
- 파일 업로드: 1시간당 50개
- 메시지 전송: 1초당 10개

### 6.3 토큰 만료
- JWT 토큰: 1시간
- 이메일 인증 코드: 10분 