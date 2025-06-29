// 상태 조회
export const status = (req, res) => {
  res.json({ success: true, message: 'SUCCESS', data: 'OK' });
};

// 세션 시작
export const startSession = (req, res) => {
  res.json({ success: true, message: 'SUCCESS', data: null });
};

// 세션 종료
export const stopSession = (req, res) => {
  res.json({ success: true, message: 'SUCCESS', data: null });
};