import jwt from "jsonwebtoken";
import * as authRepository from "../data/auth.mjs";
import {config} from "../config.mjs"

const AUTH_ERROR = { message: "인증에러" };

export const verifyToken= async (req, res, next) => {
  // 토큰을 주었는가?
  const authHeader = req.get("Authorization");
  console.log(authHeader);

  if (!(authHeader && authHeader.startsWith("Bearer "))) {
    console.log("헤더 에러");
    return res.status(401).json(AUTH_ERROR);
  }
  // Bearer sadnlkjnvsknfla(토큰) --> [1] = 토큰
  const token = authHeader.split(" ")[1];
  console.log(token);

  /*
try {
  const decoded = jwt.verify(token, config.jwtSecret);
  console.log("decoded.userid:", decoded.userid);

  const user = await authRepository.findById(decoded.userid);
  if (!user) {
    console.log("아이디 없음");
    return res.status(401).json(AUTH_ERROR);
  }
  console.log("user.id: ", user.id);
  console.log("user.userid :", user.userid);
  req.id = user.id;
  next();
} catch (error) {
  console.log("토큰 에러", error);
  return res.status(401).json(AUTH_ERROR);
}
}*/
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userid = decoded.userid;
    next();
  } catch (e) {
    return res.status(403).json({ code: '403', msg: '인증에러' });
  }}