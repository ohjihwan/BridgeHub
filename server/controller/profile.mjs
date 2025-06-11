import pool from "../db/database.mjs";
import { upsertMemberInfo } from "../data/profile.mjs";

// 마이페이지 수정 (프로필 업데이트)
export const updateProfile = async (req, res) => {
  const { nickname, major, area, timezone } = req.body;
  const userid = req.userid; // verifyToken 미들웨어에서 세팅된 사용자 ID

  if (!userid) {
    return res.status(400).json({ code: "400", msg: "인증 실패: 사용자 ID가 없습니다." });
  }
  if (!nickname) {
    return res.status(400).json({ code: "400", msg: "닉네임을 입력해주세요." });
  }

  try {
    // 1) 닉네임만 members 테이블에 업데이트
    await pool.query(
      `update members set nickname = ?, updated_at = now() where userid = ?`,
      [nickname, userid]
    );

    // 2) members.id 조회
    const [[{ id: memberId }]] = await pool.query(
      `select id from members where userid = ?`,
      [userid]
    );

    // 3) major, area, timezone은 memberinfos 테이블에 upsert
    await upsertMemberInfo(memberId, major, area, timezone);

    res.status(200).json({
      code: "200",
      msg: "회원정보 변경 성공",
      data: { nickname, major, area, timezone }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: "500", msg: "서버 오류" });
  }
};
