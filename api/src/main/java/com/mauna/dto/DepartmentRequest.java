package com.mauna.dto;

import lombok.Data;

@Data
public class DepartmentRequest {
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Long directorId;
}
