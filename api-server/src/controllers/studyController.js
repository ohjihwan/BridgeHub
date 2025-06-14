const studyService = require('../services/studyService');
const multer = require('multer');
const path = require('path');

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    }
}).single('file');

// 파일 업로드 컨트롤러
const uploadFile = async (req, res) => {
    upload(req, res, async function(err) {
        if (err) {
            console.error('파일 업로드 에러:', err);
            return res.status(400).json({
                success: false,
                error: '파일 업로드에 실패했습니다.'
            });
        }

        try {
            if (!req.file) {
                throw new Error('파일이 없습니다.');
            }

            const { studyId } = req.params;
            const { userId, nickname } = req.body;

            if (!studyId || !userId || !nickname) {
                throw new Error('필수 정보가 누락되었습니다.');
            }

            const fileData = {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            };

            const result = await studyService.saveFile(studyId, userId, nickname, fileData);
            
            res.json({
                success: true,
                message: '파일 업로드 성공',
                data: {
                    url: `/uploads/${req.file.filename}`,
                    name: req.file.originalname,
                    size: req.file.size,
                    type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
                }
            });
        } catch (error) {
            console.error('파일 처리 에러:', error);
            res.status(500).json({
                success: false,
                error: error.message || '파일 처리 중 오류가 발생했습니다.'
            });
        }
    });
};

// 스터디 생성
const createStudy = async (req, res) => {
    try {
        const study = await studyService.createStudy(req.body);
        res.json({
            success: true,
            data: study
        });
    } catch (error) {
        console.error('스터디 생성 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '스터디 생성에 실패했습니다.'
        });
    }
};

// 스터디 목록 조회
const getStudyList = async (req, res) => {
    try {
        const studyList = await studyService.getStudyList();
        res.json({
            success: true,
            data: studyList
        });
    } catch (error) {
        console.error('스터디 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '스터디 목록 조회에 실패했습니다.'
        });
    }
};

// 스터디 상세 조회
const getStudyById = async (req, res) => {
    try {
        const study = await studyService.getStudyById(req.params.studyId);
        res.json({
            success: true,
            data: study
        });
    } catch (error) {
        console.error('스터디 조회 실패:', error);
        res.status(404).json({
            success: false,
            error: error.message || '스터디 조회에 실패했습니다.'
        });
    }
};

// 스터디 참여
const joinStudy = async (req, res) => {
    try {
        const { studyId } = req.params;
        const { userId, nickname } = req.body;
        
        if (!userId || !nickname) {
            throw new Error('사용자 정보가 필요합니다.');
        }

        const result = await studyService.joinStudy(studyId, userId, nickname);
        res.json({
            success: true,
            message: '스터디 참여에 성공했습니다.',
            data: result
        });
    } catch (error) {
        console.error('스터디 참여 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '스터디 참여에 실패했습니다.'
        });
    }
};

// 메시지 저장
const saveMessage = async (req, res) => {
    try {
        const message = await studyService.saveMessage(req.params.studyId, req.body);
        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        console.error('메시지 저장 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '메시지 저장에 실패했습니다.'
        });
    }
};

// 메시지 목록 조회
const getMessageList = async (req, res) => {
    try {
        const messages = await studyService.getMessageList(req.params.studyId);
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('메시지 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '메시지 목록 조회에 실패했습니다.'
        });
    }
};

module.exports = {
    createStudy,
    getStudyList,
    getStudyById,
    joinStudy,
    saveMessage,
    getMessageList,
    uploadFile
}; 