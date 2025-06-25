/**
 * (실제 미디어 연결/SFU 연동은 sfuSocketController 등에서 처리)
 * 이 서비스는 signaling 데이터의 기록/로그, relay 등만 담당
 */

export async function processOffer(offer, userId) {
  // 로그만 남기거나, 추후 분석용 저장만
  console.log(`[RTC] Offer from user ${userId}:`, offer);
  return null;
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