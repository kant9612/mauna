package com.mauna.dto;

import lombok.Data;

@Data
public class EngineerRequest {
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
}
