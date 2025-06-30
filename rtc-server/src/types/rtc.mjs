// RTC 이벤트 상수
export const RTC_EVENTS = {
  // 클라이언트 -> 서버
  GET_ROUTER_RTP_CAPABILITIES: 'getRouterRtpCapabilities',
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  CONNECT_TRANSPORT: 'connectTransport',
  PRODUCE: 'produce',
  CONSUME: 'consume',
  RESUME_CONSUMER: 'resumeConsumer',

  // 서버 -> 클라이언트
  PEER_JOINED: 'peerJoined',
  PEER_LEFT: 'peerLeft',
  NEW_PRODUCER: 'newProducer',
  PRODUCER_CLOSED: 'producerClosed',
}

// RTC 에러 코드
export const RTC_ERRORS = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_FULL: 'ROOM_FULL',
  PEER_NOT_FOUND: 'PEER_NOT_FOUND',
  TRANSPORT_NOT_FOUND: 'TRANSPORT_NOT_FOUND',
  PRODUCER_NOT_FOUND: 'PRODUCER_NOT_FOUND',
  CONSUMER_NOT_FOUND: 'CONSUMER_NOT_FOUND',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
}

// 미디어 종류
export const MEDIA_KINDS = {
  AUDIO: 'audio',
  VIDEO: 'video',
}

// Transport 상태
export const TRANSPORT_STATES = {
  NEW: 'new',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
  DISCONNECTED: 'disconnected',
  CLOSED: 'closed',
}
