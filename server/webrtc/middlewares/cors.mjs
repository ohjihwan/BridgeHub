import cors from 'cors';

const corsOptions = {
  origin: '*', // 실제 배포 시 도메인 지정 필요
  credentials: true,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;