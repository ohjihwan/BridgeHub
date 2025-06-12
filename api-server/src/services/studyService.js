const { v4: uuidv4 } = require('uuid');

// 임시 데이터 저장소 (나중에 데이터베이스로 대체)
const studies = new Map();
const messages = new Map();

// 스터디 생성
const createStudy = async (studyData) => {
    const { title, description, capacity } = studyData;
    
    if (!title || !description || !capacity) {
        throw new Error('제목, 설명, 정원이 필요합니다.');
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

    return study;
};

// 스터디 목록 조회
const getStudyList = async () => {
    return Array.from(studies.values());
};

// 스터디 상세 조회
const getStudyById = async (studyId) => {
    const study = studies.get(studyId);
    
    if (!study) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    return study;
};

// 메시지 저장
const saveMessage = async (studyId, messageData) => {
    const { userId, content } = messageData;

    if (!studyId || !userId || !content) {
        throw new Error('스터디 ID, 사용자 ID, 메시지가 필요합니다.');
    }

    if (!studies.has(studyId)) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    const message = {
        id: uuidv4(),
        userId,
        content,
        timestamp: new Date().toISOString()
    };

    const studyMessages = messages.get(studyId);
    studyMessages.push(message);

    return message;
};

// 메시지 목록 조회
const getMessageList = async (studyId) => {
    if (!studies.has(studyId)) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    return messages.get(studyId);
};

module.exports = {
    createStudy,
    getStudyList,
    getStudyById,
    saveMessage,
    getMessageList
}; 