package com.mauna.domain;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Department {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Long directorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String directorName;
    private List<Group> groups;
}
