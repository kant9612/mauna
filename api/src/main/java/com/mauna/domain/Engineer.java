package com.mauna.domain;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Engineer {
    private Long id;
    private String employeeNumber;
    private String name;
    private String email;
    private String phone;
    private String skillSet;
    private Integer experienceYears;
    private Integer experienceMonths;
    private String employmentStatus;
    private Long groupId;
    private Integer grade;
    private String subGrade;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String groupName;
    private String departmentName;
    private String gradeName;
    private java.math.BigDecimal costRate;
}
