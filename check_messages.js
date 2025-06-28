const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://thebridgehub:1111@cluster0.ed1m1eg.mongodb.net/admin?retryWrites=true&loadBalanced=false&replicaSet=atlas-9s1dlv-shard-0&readPreference=primary&srvServiceName=mongodb&connectTimeoutMS=10000&w=majority&authSource=admin&authMechanism=SCRAM-SHA-1";
const DB_NAME = "thebridgehub";

async function checkMessages() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        
        // 총 메시지 수 확인
        const totalCount = await db.collection('messages').countDocuments();
        console.log(`📊 총 메시지 수: ${totalCount}`);
        
        // 스터디 ID별 메시지 수
        const studyStats = await db.collection('messages').aggregate([
            { $group: { _id: "$studyId", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log(`📈 스터디별 메시지 수:`);
        studyStats.forEach(stat => {
            console.log(`  - 스터디 ${stat._id}: ${stat.count}개`);
        });
        
        // 최근 메시지 10개
        const recentMessages = await db.collection('messages')
            .find()
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();
            
        console.log(`\n📝 최근 메시지 10개:`);
        recentMessages.forEach((msg, i) => {
            console.log(`${i+1}. [스터디${msg.studyId}] ${msg.senderName || msg.senderId}: ${msg.content}`);
            console.log(`   시간: ${msg.timestamp}`);
        });
        
    } catch (error) {
        console.error('❌ 에러:', error.message);
    } finally {
        await client.close();
    }
}

checkMessages(); 