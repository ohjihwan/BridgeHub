package com.koreait.apiserver.service.Impl;
import com.koreait.apiserver.service.JwtService;
import com.koreait.apiserver.dto.MemberDTO;
import com.koreait.apiserver.service.MemberService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7일 (밀리초)
    private Long refreshExpiration;

    @Autowired
    private ApplicationContext applicationContext;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    @Override
    public String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        // 사용자 정보 조회 (필요할 때만 MemberService 사용)
        MemberService memberService = applicationContext.getBean(MemberService.class);
        MemberDTO member = memberService.getMemberByUsername(username);
        
        // 클레임에 사용자 정보 추가
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", member.getUsername());
        claims.put("username", member.getUsername());
        claims.put("nickname", member.getNickname() != null ? member.getNickname() : member.getUsername());
        claims.put("email", member.getEmail());
        claims.put("memberId", member.getId());

        return Jwts.builder()
                .subject(username)
                .claims(claims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    @Override
    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    @Override
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    @Override
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Override
    public Integer extractMemberId(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            
            // 클레임에서 직접 memberId 추출
            Object memberIdObj = claims.get("memberId");
            if (memberIdObj != null) {
                if (memberIdObj instanceof Integer) {
                    return (Integer) memberIdObj;
                } else if (memberIdObj instanceof Number) {
                    return ((Number) memberIdObj).intValue();
                }
            }
            
            // 기존 방식으로 fallback
            String username = getUsernameFromToken(token);
            MemberService memberService = applicationContext.getBean(MemberService.class);
            MemberDTO member = memberService.getMemberByUsername(username);
            
            if (member != null && member.getId() != null) {
                return member.getId();
            } else {
                throw new RuntimeException("사용자 ID를 찾을 수 없습니다: " + username);
            }
        } catch (Exception e) {
            throw new RuntimeException("토큰에서 사용자 ID 추출 실패", e);
        }
    }
}
