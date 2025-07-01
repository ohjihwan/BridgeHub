package com.koreait.apiserver.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "messages")
public class MongoMessage {
    
    @Id
    private String id;
    
    @Field("studyId")
    private String studyId;
    
    @Field("senderId")
    private String senderId;
    
    @Field("message")
    private String message;
    
    @Field("messageType")
    private String messageType;
    
    @Field("fileId")
    private String fileId;
    
    @Field("fileName")
    private String fileName;
    
    @Field("fileSize")
    private Long fileSize;
    
    @Field("fileType")
    private String fileType;
    
    @Field("timestamp")
    private LocalDateTime timestamp;
    
    @Field("files")
    private List<FileInfo> files;
    
    @Data
    public static class FileInfo {
        private String name;
        private String fileId;
        private Long size;
        private String type;
    }
} 