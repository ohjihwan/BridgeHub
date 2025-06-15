const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const fileService = require('../services/fileService');

// 파일 업로드
router.post('/:studyId/files', fileService.upload.single('file'), fileController.uploadFile);

// 파일 목록 조회
router.get('/:studyId/files', fileController.getFileList);

// 파일 다운로드
router.get('/:studyId/files/:filename/download', fileController.downloadFile);

// 파일 미리보기
router.get('/:studyId/files/:filename/preview', fileController.previewFile);

// 파일 삭제
router.delete('/:studyId/files/:filename', fileController.deleteFile);

module.exports = router; 