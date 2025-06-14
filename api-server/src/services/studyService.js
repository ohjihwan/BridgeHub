const { v4: uuidv4 } = require('uuid');

// 임시 데이터 저장소 (나중에 데이터베이스로 대체)
const studies = new Map();
const messages = new Map();
const studyMembers = new Map();
const files = new Map();

// 스터디 생성
const createStudy = async (studyData) => {
    const { title, subject, location, detailLocation, maxMembers, description } = studyData;
    
    if (!title || !subject || !location || !maxMembers) {
        throw new Error('제목, 과목, 장소, 최대 인원은 필수 입력 항목입니다.');
    }

    const studyId = Date.now().toString();
    const study = {
        id: studyId,
        title,
        subject,
        location,
        detailLocation,
        maxMembers: parseInt(maxMembers),
        currentMembers: 0,
        description,
        createdAt: new Date().toISOString()
    };

    studies.set(studyId, study);
    messages.set(studyId, []);
    studyMembers.set(studyId, new Set());

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

// 스터디 참여
const joinStudy = async (studyId, userId, nickname) => {
    const study = studies.get(studyId);
    
    if (!study) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    if (study.currentMembers >= study.maxMembers) {
        throw new Error('스터디 인원이 가득 찼습니다.');
    }

    const members = studyMembers.get(studyId);
    if (members.has(userId)) {
        throw new Error('이미 참여 중인 스터디입니다.');
    }

    members.add(userId);
    study.currentMembers = members.size;

    return {
        studyId,
        userId,
        nickname,
        joinedAt: new Date().toISOString()
    };
};

// 메시지 저장
const saveMessage = async (studyId, messageData) => {
    if (!studies.has(studyId)) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    const message = {
        id: uuidv4(),
        ...messageData,
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

// 파일 저장
const saveFile = async (studyId, userId, nickname, fileData) => {
    if (!studies.has(studyId)) {
        throw new Error('스터디를 찾을 수 없습니다.');
    }

    const fileId = uuidv4();
    const file = {
        id: fileId,
        studyId,
        userId,
        nickname,
        ...fileData,
        uploadedAt: new Date().toISOString()
    };

    if (!files.has(studyId)) {
        files.set(studyId, []);
    }

    const studyFiles = files.get(studyId);
    studyFiles.push(file);

    return file;
};

module.exports = {
    createStudy,
    getStudyList,
    getStudyById,
    joinStudy,
    saveMessage,
    getMessageList,
    saveFile
}; 