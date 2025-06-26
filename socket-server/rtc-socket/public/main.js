// BridgeHub 1:N(최대 10명) 화상채팅 데모 main.js
// 한국어 주석 포함, 핵심 WebRTC + Socket.IO 신호처리 및 화면공유
const socket = io();
const roomIdInput = document.getElementById("roomId");
const joinBtn = document.getElementById("joinBtn");
const startCallBtn = document.getElementById("startCallBtn");
const shareScreenBtn = document.getElementById("shareScreenBtn");
const statusDiv = document.getElementById("status");
const videoArea = document.getElementById("videoArea");
let localStream = null;
let screenStream = null;
let peers = {}; // peerId: RTCPeerConnection
let videoElements = {}; // peerId: video element
let myPeerId = null;
let joinedRoom = false;
let startedCall = false;
let turnConfig = null;
// TURN 서버 정보 받아오기
async function fetchTurnConfig() {
  const res = await fetch("/api/rtc/turn-credentials");
  const data = await res.json();
  return {
    iceServers: [
      { urls: data.urls, username: data.username, credential: data.credential },
    ],
  };
}
// 비디오 엘리먼트 동적 추가
function addVideo(peerId, stream, isLocal = false) {
  let video = videoElements[peerId];
  if (!video) {
    video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.width = 200;
    video.style.background = "#222";
    video.style.borderRadius = "6px";
    if (isLocal) video.muted = true;
    video.setAttribute("data-peer", peerId);
    videoArea.appendChild(video);
    videoElements[peerId] = video;
  }
  video.srcObject = stream;
}
// 비디오 엘리먼트 제거
function removeVideo(peerId) {
  const video = videoElements[peerId];
  if (video) {
    video.srcObject = null;
    video.remove();
    delete videoElements[peerId];
  }
}
// 방 입장
joinBtn.onclick = async () => {
  if (joinedRoom) return;
  const roomId = roomIdInput.value.trim();
  if (!roomId) {
    statusDiv.textContent = "방 ID를 입력하세요.";
    return;
  }
  turnConfig = await fetchTurnConfig();
  socket.emit("join-match", { roomId });
  statusDiv.textContent = "방 입장 요청 중...";
};
// 전화 시작
startCallBtn.onclick = async () => {
  if (!joinedRoom || startedCall) return;
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    addVideo(myPeerId, localStream, true);
    startedCall = true;
    // 각 피어에게 offer
    for (const peerId of Object.keys(peers)) {
      if (peerId === myPeerId) continue;
      await createOffer(peerId);
    }
    statusDiv.textContent = "전화 시작됨.";
  } catch (e) {
    statusDiv.textContent = "카메라/마이크 권한이 필요합니다.";
  }
};
// 화면 공유
shareScreenBtn.onclick = async () => {
  if (!startedCall) {
    statusDiv.textContent = "먼저 전화 시작을 해주세요.";
    return;
  }
  try {
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    // 내 비디오를 화면공유로 교체
    addVideo(myPeerId + "-screen", screenStream, true);
    // 각 피어에게 화면공유 트랙 추가
    for (const peerId of Object.keys(peers)) {
      const sender = peers[peerId]
        .getSenders()
        .find((s) => s.track && s.track.kind === "video");
      if (sender) sender.replaceTrack(screenStream.getVideoTracks()[0]);
    }
    statusDiv.textContent = "화면 공유 중...";
    screenStream.getVideoTracks()[0].onended = () => {
      // 화면공유 종료시 원래 카메라로 복구
      if (localStream) {
        for (const peerId of Object.keys(peers)) {
          const sender = peers[peerId]
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (sender) sender.replaceTrack(localStream.getVideoTracks()[0]);
        }
        removeVideo(myPeerId + "-screen");
        statusDiv.textContent = "화면 공유 종료";
      }
    };
  } catch (e) {
    statusDiv.textContent = "화면 공유를 취소했습니다.";
  }
};
// 소켓 이벤트 처리
socket.on("connect", () => {
  myPeerId = socket.id;
});
// 방 매칭 및 참가자 목록 수신
socket.on("matched", ({ roomId, users }) => {
  joinedRoom = true;
  statusDiv.textContent = `방(${roomId})에 입장했습니다. 전화 시작을 눌러주세요.`;
  // 기존 피어 연결 초기화
  for (const peerId of Object.keys(peers)) {
    if (!users.includes(peerId)) {
      if (peers[peerId]) peers[peerId].close();
      removeVideo(peerId);
      delete peers[peerId];
    }
  }
  // 새 피어 연결
  users.forEach((peerId) => {
    if (peerId !== myPeerId && !peers[peerId]) {
      createPeerConnection(peerId);
    }
  });
});
// 신호(signal) 메시지 처리
socket.on("signal", async ({ from, data }) => {
  if (!peers[from]) createPeerConnection(from);
  const pc = peers[from];
  if (data.sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    if (data.sdp.type === "offer") {
      // 내 스트림이 있으면 바로 answer
      if (localStream) {
        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream));
      }
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("signal", { to: from, data: { sdp: pc.localDescription } });
    }
  } else if (data.candidate) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (e) {}
  }
});
// 피어 연결 생성
function createPeerConnection(peerId) {
  const pc = new RTCPeerConnection(turnConfig);
  peers[peerId] = pc;
  // ICE 후보 전송
  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit("signal", { to: peerId, data: { candidate: e.candidate } });
    }
  };
  // 원격 스트림 수신
  pc.ontrack = (e) => {
    addVideo(peerId, e.streams[0]);
  };
  // 연결 종료시 비디오 제거
  pc.onconnectionstatechange = () => {
    if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
      removeVideo(peerId);
      pc.close();
      delete peers[peerId];
    }
  };
  // 내 스트림이 있으면 트랙 추가
  if (localStream) {
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  }
}
// offer 생성 및 전송
async function createOffer(peerId) {
  const pc = peers[peerId];
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit("signal", { to: peerId, data: { sdp: pc.localDescription } });
}
// 브라우저 종료/새로고침 시 정리
window.addEventListener("beforeunload", () => {
  socket.disconnect();
  Object.values(peers).forEach((pc) => pc.close());
});