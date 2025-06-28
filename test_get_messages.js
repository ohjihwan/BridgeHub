const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://thebridgehub:1111@cluster0.ed1m1eg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-9s1dlv-shard-0&readPreference=primary&srvServiceName=mongodb&connectTimeoutMS=10000&w=majority&authSource=admin&authMechanism=SCRAM-SHA-1";
const DB_NAME = "thebridgehub";

async function testGetMessages() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const messagesCollection = db.collection('messages');
        
        console.log('🔍 스터디 6의 메시지 조회 테스트');
        
        // 1. 모든 스터디 6 메시지 (isDeleted 조건 없이)
        const allMessages = await messagesCollection
            .find({ studyId: "6" })
            .sort({ timestamp: -1 })
            .toArray();
        console.log(`📊 studyId="6"인 메시지: ${allMessages.length}개`);
        
        // 2. isDeleted가 false인 메시지
        const notDeletedMessages = await messagesCollection
            .find({ 
                studyId: "6", 
                isDeleted: false 
            })
            .sort({ timestamp: -1 })
            .toArray();
        console.log(`📊 studyId="6"이고 isDeleted=false인 메시지: ${notDeletedMessages.length}개`);
        
        // 3. isDeleted 필드가 없는 메시지
        const noDeletedField = await messagesCollection
            .find({ 
                studyId: "6", 
                isDeleted: { $exists: false }
            })
            .sort({ timestamp: -1 })
            .toArray();
        console.log(`📊 studyId="6"이고 isDeleted 필드가 없는 메시지: ${noDeletedField.length}개`);
        
        // 4. 숫자 6으로 조회
        const numericStudyId = await messagesCollection
            .find({ studyId: 6 })
            .sort({ timestamp: -1 })
            .toArray();
        console.log(`📊 studyId=6 (숫자)인 메시지: ${numericStudyId.length}개`);
        
        // 5. 실제 getRecentMessages 로직 테스트
        console.log('\n🧪 getRecentMessages 로직 테스트:');
        const recentMessages = await messagesCollection
            .find({ 
                studyId: "6", 
                isDeleted: false 
            })
            .sort({ timestamp: -1 })
            .limit(50)
            .toArray();
            
        const reversedMessages = recentMessages.reverse();
        console.log(`📋 반환될 메시지 수: ${reversedMessages.length}개`);
        
        if (reversedMessages.length > 0) {
            console.log('\n📝 처음 5개 메시지:');
            reversedMessages.slice(0, 5).forEach((msg, i) => {
                console.log(`${i+1}. ${msg.senderName || msg.senderId}: ${msg.content}`);
                console.log(`   isDeleted: ${msg.isDeleted}, studyId: ${msg.studyId} (type: ${typeof msg.studyId})`);
            });
        }
        
    } catch (error) {
        console.error('❌ 에러:', error.message);
    } finally {
        await client.close();
    }
}

testGetMessages(); 