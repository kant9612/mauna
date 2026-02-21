package com.mauna.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String role;
    private Long engineerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // JOINで取得する追加フィールド
    private Long groupId;
    private String groupName;
}
