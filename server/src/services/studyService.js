const studies = new Map();
const chatRooms = new Map();

class StudyService {
    constructor() {
        this.studies = new Map();
        this.chatRooms = new Map();
    }

    // 스터디 생성
    async createStudy(studyData) {
        const studyId = Date.now().toString();
        const study = {
            id: studyId,
            ...studyData,
            createdAt: new Date(),
            members: [studyData.creatorId],
            chatRooms: [],
            messages: [],
            files: []
        };
        this.studies.set(studyId, study);
        return study;
    }

    // 스터디 목록 조회
    async getStudyList() {
        return Array.from(this.studies.values());
    }

    // 스터디 상세 조회
    async getStudyDetail(studyId) {
        return this.studies.get(studyId);
    }

    // 스터디 참여
    async joinStudy(studyId, userId) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }
        if (study.members.includes(userId)) {
            throw new Error('이미 참여 중인 스터디입니다.');
        }
        if (study.members.length >= study.capacity) {
            throw new Error('스터디 정원이 가득 찼습니다.');
        }
        study.members.push(userId);
        return study;
    }

    // 스터디 퇴장
    async leaveStudy(studyId, userId) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }
        const memberIndex = study.members.indexOf(userId);
        if (memberIndex === -1) {
            throw new Error('스터디에 참여하고 있지 않습니다.');
        }
        study.members.splice(memberIndex, 1);
        return study;
    }

    // 채팅방 생성
    async createChatRoom(studyId, { name, creatorId }) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }
        if (!study.members.includes(creatorId)) {
            throw new Error('스터디 멤버만 채팅방을 생성할 수 있습니다.');
        }

        const chatRoomId = Date.now().toString();
        const chatRoom = {
            id: chatRoomId,
            studyId,
            name,
            creatorId,
            createdAt: new Date(),
            messages: []
        };

        // 채팅방 저장
        this.chatRooms.set(chatRoomId, chatRoom);
        
        // 스터디에 채팅방 추가
        study.chatRooms.push(chatRoomId);

        return chatRoom;
    }

    // 채팅방 목록 조회
    async getChatRooms(studyId) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }

        return study.chatRooms.map(chatRoomId => this.chatRooms.get(chatRoomId));
    }

    // 스터디 메시지 조회
    async getStudyMessages(studyId) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }
        return study.messages;
    }

    // 스터디 파일 조회
    async getStudyFiles(studyId) {
        const study = this.studies.get(studyId);
        if (!study) {
            throw new Error('스터디를 찾을 수 없습니다.');
        }
        return study.files;
    }
}

module.exports = new StudyService(); 