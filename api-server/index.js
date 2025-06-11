/**
 * BridgeHub 서버 메인 파일
 * 이메일 인증 및 사용자 인증을 처리하는 서버입니다.
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const emailRoutes = require('./src/routes/emailRoutes');
const studyRoutes = require('./src/routes/studyRoutes');

const app = express();
const server = http.createServer(app);

// uploads 디렉토리 생성
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    console.log('uploads 디렉토리 생성:', uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
}

const port = process.env.PORT || 7100;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 미들웨어 설정
app.use(cors({
    origin: "*",  // 모든 origin 허용
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 정적 파일 제공 설정
app.use('/uploads', express.static(uploadDir));
app.use('/test', express.static(path.join(__dirname, 'test')));

// 이메일 전송을 위한 transporter 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 인증 코드 저장을 위한 임시 저장소
const verificationCodes = new Map();

// 인증 코드 생성 함수
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// JWT 토큰 생성 함수
function generateToken(email) {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' });
}

// 이메일 인증 요청 처리
app.post('/api/email/send-verification', async (req, res) => {
    try {
        const { email } = req.body;
        console.log('이메일 인증 요청:', email);
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: '이메일 주소가 필요합니다.' 
            });
        }

        const verificationCode = generateVerificationCode();
        console.log('생성된 인증 코드:', verificationCode);
        
        verificationCodes.set(email, {
            code: verificationCode,
            timestamp: Date.now()
        });
        console.log('저장된 인증 데이터:', verificationCodes.get(email));

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'BridgeHub 이메일 인증',
            html: `
                <h1>BridgeHub 이메일 인증</h1>
                <p>안녕하세요! BridgeHub 서비스 가입을 위한 인증 코드입니다.</p>
                <h2>인증 코드: ${verificationCode}</h2>
                <p>이 인증 코드는 10분 동안 유효합니다.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('이메일 전송 완료');
        return res.status(200).json({ 
            success: true,
            message: '인증 이메일이 전송되었습니다.',
            data: {
                email: email
            }
        });
    } catch (error) {
        console.error('이메일 전송 에러:', error);
        return res.status(500).json({ 
            success: false,
            error: '이메일 전송에 실패했습니다.' 
        });
    }
});

// 인증 코드 확인
app.post('/api/email/verify-code', (req, res) => {
    const { email, code } = req.body;
    console.log('인증 시도:', { email, code });
    console.log('저장된 인증 코드:', verificationCodes.get(email));

    if (!email || !code) {
        return res.status(400).json({ 
            success: false,
            error: '이메일과 인증 코드가 필요합니다.' 
        });
    }

    const verificationData = verificationCodes.get(email);
    
    if (!verificationData) {
        console.log('인증 데이터 없음');
        return res.status(400).json({ 
            success: false,
            error: '인증 코드가 만료되었거나 존재하지 않습니다.' 
        });
    }

    // 10분 제한 확인
    if (Date.now() - verificationData.timestamp > 10 * 60 * 1000) {
        console.log('인증 코드 만료');
        verificationCodes.delete(email);
        return res.status(400).json({ 
            success: false,
            error: '인증 코드가 만료되었습니다.' 
        });
    }

    console.log('코드 비교:', { 
        입력된코드: code, 
        저장된코드: verificationData.code,
        일치여부: verificationData.code === code 
    });

    if (verificationData.code === code) {
        console.log('인증 성공, 토큰 생성');
        verificationCodes.delete(email);
        // 인증 성공 시 JWT 토큰 생성
        const token = generateToken(email);
        console.log('생성된 토큰:', token);
        
        // 성공 응답
        return res.status(200).json({ 
            success: true,
            message: '이메일 인증이 완료되었습니다.',
            data: {
                token: token,
                email: email
            }
        });
    } else {
        console.log('잘못된 인증 코드');
        return res.status(400).json({ 
            success: false,
            error: '잘못된 인증 코드입니다.' 
        });
    }
});

// 토큰 검증 미들웨어
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
};

// 보호된 라우트 예시
app.get('/api/protected', verifyToken, (req, res) => {
    res.json({ 
        message: '보호된 리소스에 접근했습니다.',
        user: req.user
    });
});

// 파일 다운로드 라우트
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    console.log('파일 다운로드 요청:', {
        filename: filename,
        filePath: filePath
    });
    
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error('파일 다운로드 에러:', err);
            res.status(404).send('파일을 찾을 수 없습니다.');
        }
    });
});

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const studyId = req.params.studyId;
        const studyDir = path.join(__dirname, 'uploads', studyId);
        if (!fs.existsSync(studyDir)) {
            fs.mkdirSync(studyDir, { recursive: true });
        }
        cb(null, studyDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// 임시 데이터 저장소
const studies = new Map();
const messages = new Map();

// 스터디 생성
app.post('/api/study', (req, res) => {
    try {
        const { title, description, capacity } = req.body;
        if (!title || !description || !capacity) {
            return res.status(400).json({
                success: false,
                error: '제목, 설명, 정원이 필요합니다.'
            });
        }

        const studyId = Date.now().toString();
        const study = {
            id: studyId,
            title,
            description,
            capacity: parseInt(capacity),
            createdAt: new Date().toISOString()
        };

        studies.set(studyId, study);
        messages.set(studyId, []);

        res.json({
            success: true,
            data: study
        });
    } catch (error) {
        console.error('스터디 생성 실패:', error);
        res.status(500).json({
            success: false,
            error: '스터디 생성에 실패했습니다.'
        });
    }
});

// 스터디 목록 조회
app.get('/api/study', (req, res) => {
    try {
        const studyList = Array.from(studies.values());
        res.json({
            success: true,
            data: studyList
        });
    } catch (error) {
        console.error('스터디 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '스터디 목록 조회에 실패했습니다.'
        });
    }
});

// 스터디 상세 조회
app.get('/api/study/:studyId', (req, res) => {
    try {
        const { studyId } = req.params;
        const study = studies.get(studyId);

        if (!study) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: study
        });
    } catch (error) {
        console.error('스터디 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '스터디 조회에 실패했습니다.'
        });
    }
});

// 메시지 저장
app.post('/api/study/:studyId/messages', (req, res) => {
    try {
        const { studyId } = req.params;
        const { userId, content } = req.body;

        if (!studyId || !userId || !content) {
            return res.status(400).json({
                success: false,
                error: '스터디 ID, 사용자 ID, 메시지가 필요합니다.'
            });
        }

        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const message = {
            id: uuidv4(),
            userId,
            content,
            timestamp: new Date().toISOString()
        };

        const studyMessages = messages.get(studyId);
        studyMessages.push(message);

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('메시지 저장 실패:', error);
        res.status(500).json({
            success: false,
            error: '메시지 저장에 실패했습니다.'
        });
    }
});

// 메시지 목록 조회
app.get('/api/study/:studyId/messages', (req, res) => {
    try {
        const { studyId } = req.params;
        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const studyMessages = messages.get(studyId);
        res.json({
            success: true,
            data: studyMessages
        });
    } catch (error) {
        console.error('메시지 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '메시지 목록 조회에 실패했습니다.'
        });
    }
});

// 파일 업로드
app.post('/api/study/:studyId/files', upload.single('file'), (req, res) => {
    try {
        const { studyId } = req.params;
        const { userId } = req.body;
        const file = req.file;

        if (!studyId || !userId || !file) {
            return res.status(400).json({
                success: false,
                error: '스터디 ID, 사용자 ID, 파일이 필요합니다.'
            });
        }

        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const fileInfo = {
            id: uuidv4(),
            userId,
            originalName: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: fileInfo
        });
    } catch (error) {
        console.error('파일 업로드 실패:', error);
        res.status(500).json({
            success: false,
            error: '파일 업로드에 실패했습니다.'
        });
    }
});

// 파일 목록 조회
app.get('/api/study/:studyId/files', (req, res) => {
    try {
        const { studyId } = req.params;
        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const studyDir = path.join(__dirname, 'uploads', studyId);
        if (!fs.existsSync(studyDir)) {
            return res.json({
                success: true,
                data: []
            });
        }

        const files = fs.readdirSync(studyDir).map(filename => {
            const filePath = path.join(studyDir, filename);
            const stats = fs.statSync(filePath);
            return {
                id: uuidv4(),
                filename,
                originalName: filename.split('-').slice(1).join('-'),
                size: stats.size,
                timestamp: stats.mtime.toISOString()
            };
        });

        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('파일 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: '파일 목록 조회에 실패했습니다.'
        });
    }
});

// 라우트 등록
app.use('/api/email', emailRoutes);
app.use('/api/study', studyRoutes);

// 기본 라우트
app.get('/', (req, res) => {
    res.json({ message: 'BridgeHub API 서버가 실행 중입니다.' });
});

// 서버 시작
server.listen(port, () => {
    console.log(`API 서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 