export async function createWebRtcTransport(peerId, direction) {
  const transport = await worker.createWebRtcTransport({
    listenIps: [{ ip: '0.0.0.0', announcedIp: null }],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,

    // TURN/STUN 서버 연동
    iceServers: [
      {
        urls: [
          'stun:54.252.32.250:3478',
          'turn:54.252.32.250:3478?transport=udp',
          'turn:54.252.32.250:3478?transport=tcp'
        ],
        username: 'your-username',  // TURN 서버에 설정된 유저
        credential: 'your-password' // TURN 서버에 설정된 패스워드
      }
    ]
  });

  transport.appData = { peerId, direction };

  const params = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters
  };

  return { transport, params };
}
