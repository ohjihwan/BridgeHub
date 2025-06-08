const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');

// 스터디 생성
router.post('/create', studyController.createStudy);

// 스터디 목록 조회
router.get('/list', studyController.getStudyList);

// 스터디 상세 조회
router.get('/:studyId', studyController.getStudyDetail);

// 스터디 참여
router.post('/:studyId/join', studyController.joinStudy);

// 스터디 퇴장
router.post('/:studyId/leave', studyController.leaveStudy);

// 스터디 채팅방 생성
router.post('/:studyId/chat', studyController.createChatRoom);

// 스터디 채팅방 목록 조회
router.get('/:studyId/chats', studyController.getChatRooms);

// 스터디 메시지 조회
router.get('/:studyId/messages', studyController.getStudyMessages);

// 스터디 파일 조회
router.get('/:studyId/files', studyController.getStudyFiles);

module.exports = router; 