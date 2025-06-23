package com.koreait.thebridgehub.service;

import io.jsonwebtoken.Claims;

public interface JwtService {
    String generateToken(String username);
    boolean validateToken(String token);
    String getUsernameFromToken(String token);
    Claims getAllClaimsFromToken(String token);
    Integer extractMemberId(String token);
    String extractRole(String token); // JWT 토큰에서 role 정보 추출
}