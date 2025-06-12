const studyService = require('../services/studyService');

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
    saveMessage,
    getMessageList
}; 