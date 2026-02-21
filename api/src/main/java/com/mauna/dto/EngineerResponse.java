package com.mauna.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EngineerResponse {
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
    private BigDecimal costRate;

    public static EngineerResponse fromDomain(com.mauna.domain.Engineer engineer) {
        EngineerResponse response = new EngineerResponse();
        response.setId(engineer.getId());
        response.setEmployeeNumber(engineer.getEmployeeNumber());
        response.setName(engineer.getName());
        response.setEmail(engineer.getEmail());
        response.setPhone(engineer.getPhone());
        response.setSkillSet(engineer.getSkillSet());
        response.setExperienceYears(engineer.getExperienceYears());
        response.setExperienceMonths(engineer.getExperienceMonths());
        response.setEmploymentStatus(engineer.getEmploymentStatus());
        response.setGroupId(engineer.getGroupId());
        response.setGrade(engineer.getGrade());
        response.setSubGrade(engineer.getSubGrade());
        response.setCreatedAt(engineer.getCreatedAt());
        response.setUpdatedAt(engineer.getUpdatedAt());
        response.setGroupName(engineer.getGroupName());
        response.setDepartmentName(engineer.getDepartmentName());
        response.setGradeName(engineer.getGradeName());
        response.setCostRate(engineer.getCostRate());
        return response;
    }
}
