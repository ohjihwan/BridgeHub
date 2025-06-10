// const pc = new wrtc.RTCPeerConnection(...);

export const processOffer = async (offer, userId) => {
  console.log(`📨 Offer received from user ${userId}:`, offer);

  // PeerConnection 생성
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });

  // Offer 적용
  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  // Answer 생성
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  // SDP 전달
  return answer;
};
export const processAnswer = async (answer, userId) => {
  console.log(`✅ Answer received from user ${userId}:`, answer);

  
  // 이 자리에 SFU 연결 처리나 Peer 관리 로직이 들어감
  // 지금은 로그만 출력
};

export const processCandidate = async (candidate, userId) => {
  console.log(`📶 ICE candidate received from ${userId}:`, candidate);

  // 추후 이 자리에서:
  // - 상대방에게 전달 (signaling server 연동)
  // - SFU 라우팅에 반영 (mediasoup transport 등)
};

