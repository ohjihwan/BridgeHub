<<<<<<< HEAD
import pool from '../db/database.mjs';

// 테이블 삽입 또는 업데이트 
export async function upsertMemberInfo(memberId, major, area, timezone) {
  const sql = `
    INSERT INTO memberinfos (member_id, major, area, timezone)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      major      = VALUES(major),
      area       = VALUES(area),
      timezone   = VALUES(timezone),
      updated_at = NOW()
  `;
  await pool.query(sql, [memberId, major, area, timezone]);
}

// 마이페이지 정보 조회 --> 방에 들어갈 예정
export async function getMemberInfo(memberId) {
  const [rows] = await pool.query(
    'SELECT * FROM memberinfos WHERE member_id = ?',
    [memberId]
  );
  return rows[0] || null;
=======
import pool from '../db/database.mjs';

// 테이블 삽입 또는 업데이트 
export async function upsertMemberInfo(memberId, major, area, timezone) {
  const sql = `
    INSERT INTO memberinfos (member_id, major, area, timezone)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      major      = VALUES(major),
      area       = VALUES(area),
      timezone   = VALUES(timezone),
      updated_at = NOW()
  `;
  await pool.query(sql, [memberId, major, area, timezone]);
}

// 마이페이지 정보 조회 --> 방에 들어갈 예정
export async function getMemberInfo(memberId) {
  const [rows] = await pool.query(
    'SELECT * FROM memberinfos WHERE member_id = ?',
    [memberId]
  );
  return rows[0] || null;
>>>>>>> 9bcc0d6c86a0d8b65a1c4656d3c50dcfda7acea6
}