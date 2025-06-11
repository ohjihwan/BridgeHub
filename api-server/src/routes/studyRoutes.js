const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 임시 데이터 저장소
const studies = new Map();
const messages = new Map();

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const studyId = req.params.studyId;
        const studyDir = path.join(__dirname, '../../uploads', studyId);
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

// 스터디 생성
router.post('/', (req, res) => {
    try {
        const { title, subject, location, subLocation, capacity, description, creatorId } = req.body;
        
        if (!title || !subject || !location || !subLocation || !capacity || !description || !creatorId) {
            return res.status(400).json({
                success: false,
                error: '모든 필수 필드를 입력해주세요.'
            });
        }

        const studyId = Date.now().toString();
        const study = {
            id: studyId,
            title,
            subject,
            location,
            subLocation,
            capacity: parseInt(capacity),
            description,
            creatorId,
            members: [creatorId],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        studies.set(studyId, study);
        messages.set(studyId, []); // 스터디별 메시지 저장소 초기화

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
router.get('/', (req, res) => {
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
router.get('/:studyId', (req, res) => {
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
router.post('/:studyId/messages', (req, res) => {
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
router.get('/:studyId/messages', (req, res) => {
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
router.post('/:studyId/files', upload.single('file'), (req, res) => {
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
router.get('/:studyId/files', (req, res) => {
    try {
        const { studyId } = req.params;
        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const studyDir = path.join(__dirname, '../../uploads', studyId);
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

// 파일 다운로드
router.get('/:studyId/files/:filename', (req, res) => {
    try {
        const { studyId, filename } = req.params;
        if (!studies.has(studyId)) {
            return res.status(404).json({
                success: false,
                error: '스터디를 찾을 수 없습니다.'
            });
        }

        const filePath = path.join(__dirname, '../../uploads', studyId, filename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: '파일을 찾을 수 없습니다.'
            });
        }

        res.download(filePath);
    } catch (error) {
        console.error('파일 다운로드 실패:', error);
        res.status(500).json({
            success: false,
            error: '파일 다운로드에 실패했습니다.'
        });
    }
});

module.exports = router; 