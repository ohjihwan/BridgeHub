const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// MIME 타입 매핑
const MIME_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain'
};

// 파일 필터
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (Object.keys(MIME_TYPES).includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
};

// 파일 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const studyId = req.params.studyId;
        const studyDir = path.join(UPLOAD_DIR, studyId);
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

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    }
});

// 파일 업로드 처리
const uploadFile = async (req) => {
    if (!req.file) {
        throw new Error('파일이 없습니다.');
    }

    const fileUrl = `/uploads/${req.params.studyId}/${req.file.filename}`;
    
    return {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        mimeType: getMimeType(req.file.originalname)
    };
};

// 파일 목록 조회
const getFileList = async (studyId) => {
    const studyDir = path.join(UPLOAD_DIR, studyId);
    if (!fs.existsSync(studyDir)) {
        return [];
    }

    const files = fs.readdirSync(studyDir).map(filename => {
        const filePath = path.join(studyDir, filename);
        const stats = fs.statSync(filePath);
        const originalName = filename.split('-').slice(1).join('-');
        
        return {
            id: uuidv4(),
            filename,
            originalName,
            size: stats.size,
            url: `/uploads/${studyId}/${filename}`,
            mimeType: getMimeType(originalName),
            timestamp: stats.mtime.toISOString()
        };
    });

    return files;
};

// 파일 다운로드
const downloadFile = async (studyId, filename) => {
    const filePath = path.join(UPLOAD_DIR, studyId, filename);
    
    if (!fs.existsSync(filePath)) {
        throw new Error('파일을 찾을 수 없습니다.');
    }

    const stats = fs.statSync(filePath);
    const originalName = filename.split('-').slice(1).join('-');

    return {
        filePath,
        originalName,
        size: stats.size,
        mimeType: getMimeType(originalName)
    };
};

// MIME 타입 확인
const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase();
    return MIME_TYPES[ext] || 'application/octet-stream';
};

// 파일 정보 저장
const saveFileInfo = async (studyId, fileInfo) => {
    const filePath = path.join(UPLOAD_DIR, studyId, fileInfo.filename);
    if (!fs.existsSync(filePath)) {
        throw new Error('파일이 존재하지 않습니다.');
    }

    return {
        ...fileInfo,
        studyId,
        uploadTime: new Date().toISOString()
    };
};

// 파일 삭제
const deleteFile = async (studyId, filename) => {
    const filePath = path.join(UPLOAD_DIR, studyId, filename);
    
    if (!fs.existsSync(filePath)) {
        throw new Error('파일을 찾을 수 없습니다.');
    }

    try {
        await fs.promises.unlink(filePath);
        return true;
    } catch (error) {
        throw new Error('파일 삭제에 실패했습니다.');
    }
};

module.exports = {
    upload,
    uploadFile,
    getFileList,
    downloadFile,
    saveFileInfo,
    deleteFile
}; 