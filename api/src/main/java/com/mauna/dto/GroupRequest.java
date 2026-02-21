package com.mauna.dto;

import lombok.Data;

@Data
public class GroupRequest {
    private Long departmentId;
    private String code;
    private String name;
    private String description;
    private Long leaderId;
    private Integer displayOrder;
    private Boolean isActive;
}
