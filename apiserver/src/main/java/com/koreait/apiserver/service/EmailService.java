package com.koreait.apiserver.service;

public interface EmailService {
    void sendVerificationEmail(String email);
    boolean verifyEmail(String email, String code);
    boolean isEmailVerified(String email);
}

