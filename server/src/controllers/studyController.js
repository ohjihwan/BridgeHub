const studyService = require('../services/studyService');

class StudyController {
    // 스터디 생성
    async createStudy(req, res) {
        try {
            const studyData = req.body;
            const study = await studyService.createStudy(studyData);
            res.status(201).json(study);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 목록 조회
    async getStudyList(req, res) {
        try {
            const studies = await studyService.getStudyList();
            res.json(studies);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 상세 조회
    async getStudyDetail(req, res) {
        try {
            const { studyId } = req.params;
            const study = await studyService.getStudyDetail(studyId);
            if (!study) {
                return res.status(404).json({ message: '스터디를 찾을 수 없습니다.' });
            }
            res.json(study);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 참여
    async joinStudy(req, res) {
        try {
            const { studyId } = req.params;
            const { userId } = req.body;
            const result = await studyService.joinStudy(studyId, userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 퇴장
    async leaveStudy(req, res) {
        try {
            const { studyId } = req.params;
            const { userId } = req.body;
            const result = await studyService.leaveStudy(studyId, userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 채팅방 생성
    async createChatRoom(req, res) {
        try {
            const { studyId } = req.params;
            const { name, creatorId } = req.body;
            const chatRoom = await studyService.createChatRoom(studyId, { name, creatorId });
            res.status(201).json(chatRoom);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 채팅방 목록 조회
    async getChatRooms(req, res) {
        try {
            const { studyId } = req.params;
            const chatRooms = await studyService.getChatRooms(studyId);
            res.json(chatRooms);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 메시지 조회
    async getStudyMessages(req, res) {
        try {
            const { studyId } = req.params;
            const messages = await studyService.getStudyMessages(studyId);
            res.json(messages);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 스터디 파일 조회
    async getStudyFiles(req, res) {
        try {
            const { studyId } = req.params;
            const files = await studyService.getStudyFiles(studyId);
            res.json(files);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // 파일 업로드
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: '파일이 없습니다.' });
            }

            const { studyId } = req.params;
            const fileInfo = {
                fileName: req.file.originalname,
                fileUrl: `/uploads/${req.file.filename}`,
                fileSize: req.file.size,
                studyId: studyId,
                uploadTime: new Date()
            };

            // 파일 정보를 데이터베이스에 저장하는 로직 추가 필요
            // await studyService.saveFileInfo(fileInfo);

            console.log('파일 업로드 성공:', fileInfo);
            
            res.json({
                success: true,
                fileUrl: fileInfo.fileUrl,
                fileName: fileInfo.fileName,
                fileSize: fileInfo.fileSize
            });
        } catch (error) {
            console.error('파일 업로드 에러:', error);
            res.status(500).json({ success: false, message: '파일 업로드에 실패했습니다.' });
        }
    }
}

module.exports = new StudyController(); 