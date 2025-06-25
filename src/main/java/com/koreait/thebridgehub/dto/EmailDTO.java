package com.koreait.thebridgehub.dto;
import lombok.Data;

@Data
public class EmailDTO {
    private String email;
    private String verificationCode;
    private boolean verified;
    private long expirationTime;
}