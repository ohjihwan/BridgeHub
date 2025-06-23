package com.koreait.thebridgehub.security;

import com.koreait.thebridgehub.dao.MemberDao;
import com.koreait.thebridgehub.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberDao memberDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberDao.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        return User.builder()
                .username(member.getUsername())
                .password(member.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getRole())))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!member.getEmailVerified())
                .build();
    }
} 