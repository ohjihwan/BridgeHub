import cors from 'cors';

// const allowedOrigins = [
//   'http://localhost:7000',
//   'https://thebridgehub.org',
//   'https://www.thebridgehub.org',
//   'http://thebridgehub.org:7000'
// ];

 // 개발용: 동일 네트워크 내 접근을 위해 전체 허용
 const corsOptions = {
   origin: true,   // 요청 Origin 헤더 그대로 허용
   credentials: true,
 };

// const corsMiddleware = cors(corsOptions);
 import cors from 'cors';
 const corsMiddleware = cors(corsOptions);
export default corsMiddleware;