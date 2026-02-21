package com.mauna.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Group {
    private Long id;
    private Long departmentId;
    private String code;
    private String name;
    private String description;
    private Long leaderId;
    private Integer displayOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String departmentName;
    private String leaderName;
}
