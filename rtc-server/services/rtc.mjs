/**
 * (실제 미디어 연결/SFU 연동은 sfuSocketController 등에서 처리)
 * 이 서비스는 signaling 데이터의 기록/로그, relay 등만 담당
 */

export async function processOffer(offer, userId) {
  // 실무에선 이곳에서 로그만 남기거나, 추후 분석용 저장만
  console.log(`[RTC] Offer from user ${userId}:`, offer);
  // 실전 SFU 환경에선 직접 PeerConnection 생성 안함
  // 대신 SFU 컨트롤러에서 트랜스포트/생산자/소비자 생성
  return null; // 직접 Answer 반환X, SFU가 answer 생성
}

export async function processAnswer(answer, userId) {
  // Answer 수신시 처리(로그 등)
  console.log(`[RTC] Answer from user ${userId}:`, answer);
  // 보통 여기서 별도 처리 필요 없음
}

export async function processCandidate(candidate, userId) {
  // ICE candidate 수신시 로그 등
  console.log(`[RTC] ICE candidate from user ${userId}:`, candidate);
  // 실무에서는 SFU에 트랜스포트 추가 등 연동
}