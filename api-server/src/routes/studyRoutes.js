const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

// 스터디 생성
router.post('/', studyController.createStudy);

// 스터디 목록 조회
router.get('/', studyController.getStudyList);

// 스터디 상세 조회
router.get('/:studyId', studyController.getStudyById);

// 메시지 저장
router.post('/:studyId/messages', studyController.saveMessage);

// 메시지 목록 조회
router.get('/:studyId/messages', studyController.getMessageList);

module.exports = router; 