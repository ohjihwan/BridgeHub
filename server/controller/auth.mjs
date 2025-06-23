import pool from "../db/database.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.mjs";

// 회원가입 처리
export const register = async (req, res) => {
  const { name, userid, password, gender,phone, education,nickname } = req.body;
  if (!name || !userid || !password) {
    return res.status(400).json({ msg: "필수값을 입력해주세요." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [rows] = await pool.query(
      `INSERT INTO members (userid, name, password, gender, phone, education,nickname)
       VALUES (?, ?, ?, ?, ?)`,
      [userid, name, hashedPassword, phone, nickname]
    );
    res.status(201).json({ msg: "회원가입 성공", userId: rows.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
};

// 로그인 처리
export const login = async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    return res.status(400).json({ msg: "필수값을 입력해주세요." });
  }

  try {
    // DB에서 사용자 정보 조회 
    const [rows] = await pool.query(
      "SELECT * FROM members WHERE userid = ?",
      [userid]
    );

    if (rows.length === 0) {
      return res.status(401).json({ msg: "아이디가 없습니다." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ msg: "비밀번호가 틀렸습니다." });

    // JWT 토큰 발급
    const token = jwt.sign({ id:user.id ,userid: user.userid  }, config.jwtSecret, { expiresIn: "1d" });
    res.json({ msg: "로그인 성공", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "서버 오류" });
  }
};
