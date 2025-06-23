import pool from '../db/database.mjs';


/*id로 사용자 조회
export async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM members WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}
*/

// 회원가입 
export async function createUser({ userid, userpw, name, hp, nickname }) {
  await pool.execute(
    `INSERT INTO members
       (userid, password, name, phone, nickname)
     VALUES (?, ?, ?, ?, ?)`,
    [userid, userpw, name, hp, nickname]
  );
}