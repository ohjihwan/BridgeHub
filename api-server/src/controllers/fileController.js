const fileService = require('../services/fileService');
const fs = require('fs');

// 파일 업로드
const uploadFile = async (req, res) => {
    try {
        const fileInfo = await fileService.uploadFile(req);
        const savedFileInfo = await fileService.saveFileInfo(req.params.studyId, fileInfo);
        
        res.json({
            success: true,
            data: savedFileInfo
        });
    } catch (error) {
        console.error('파일 업로드 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '파일 업로드에 실패했습니다.'
        });
    }
};

// 파일 목록 조회
const getFileList = async (req, res) => {
    try {
        const { studyId } = req.params;
        const files = await fileService.getFileList(studyId);
        res.json({
            success: true,
            data: files
        });
    } catch (error) {
        console.error('파일 목록 조회 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '파일 목록 조회에 실패했습니다.'
        });
    }
};

// 파일 다운로드
const downloadFile = async (req, res) => {
    try {
        const { studyId, filename } = req.params;
        const fileInfo = await fileService.downloadFile(studyId, filename);
        
        // 파일 다운로드 헤더 설정
        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.originalName)}"`);
        res.setHeader('Content-Length', fileInfo.size);
        
        // 파일 스트림으로 전송
        const fileStream = fs.createReadStream(fileInfo.filePath);
        fileStream.pipe(res);
        
        // 에러 처리
        fileStream.on('error', (error) => {
            console.error('파일 스트림 에러:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: '파일 전송 중 오류가 발생했습니다.'
                });
            }
        });
    } catch (error) {
        console.error('파일 다운로드 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '파일 다운로드에 실패했습니다.'
        });
    }
};

// 파일 미리보기
const previewFile = async (req, res) => {
    try {
        const { studyId, filename } = req.params;
        const fileInfo = await fileService.downloadFile(studyId, filename);
        
        // 이미지 파일인 경우에만 미리보기 제공
        if (fileInfo.mimeType.startsWith('image/')) {
            res.setHeader('Content-Type', fileInfo.mimeType);
            res.setHeader('Content-Length', fileInfo.size);
            
            const fileStream = fs.createReadStream(fileInfo.filePath);
            fileStream.pipe(res);
            
            fileStream.on('error', (error) => {
                console.error('파일 스트림 에러:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: '파일 전송 중 오류가 발생했습니다.'
                    });
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: '이미지 파일만 미리보기가 가능합니다.'
            });
        }
    } catch (error) {
        console.error('파일 미리보기 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '파일 미리보기에 실패했습니다.'
        });
    }
};

// 파일 삭제
const deleteFile = async (req, res) => {
    try {
        const { studyId, filename } = req.params;
        await fileService.deleteFile(studyId, filename);
        
        res.json({
            success: true,
            message: '파일이 삭제되었습니다.'
        });
    } catch (error) {
        console.error('파일 삭제 실패:', error);
        res.status(500).json({
            success: false,
            error: error.message || '파일 삭제에 실패했습니다.'
        });
    }
};

module.exports = {
    uploadFile,
    getFileList,
    downloadFile,
    previewFile,
    deleteFile
}; 