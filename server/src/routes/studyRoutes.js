const express = require('express');
const router = express.Router();
const studyController = require('../controllers/studyController');
const multer = require('multer');
const path = require('path');

// 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // uploads 폴더에 파일 저장
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname) // 파일명 중복 방지
    }
});

const upload = multer({ storage: storage });

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

// 파일 업로드
router.post('/:studyId/upload', upload.single('file'), studyController.uploadFile);

module.exports = router; 