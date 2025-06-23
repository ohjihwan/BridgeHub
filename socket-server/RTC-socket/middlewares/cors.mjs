import cors from 'cors';

const allowedOrigins = [
  'http://localhost:7000',
  'https://thebridgehub.org',
  'https://www.thebridgehub.org',
  'http://thebridgehub.org:7000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;