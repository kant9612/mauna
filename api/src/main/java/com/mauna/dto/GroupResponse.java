package com.mauna.dto;

import com.mauna.domain.Group;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
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

    public static GroupResponse fromDomain(Group group) {
        GroupResponse response = new GroupResponse();
        response.setId(group.getId());
        response.setDepartmentId(group.getDepartmentId());
        response.setCode(group.getCode());
        response.setName(group.getName());
        response.setDescription(group.getDescription());
        response.setLeaderId(group.getLeaderId());
        response.setDisplayOrder(group.getDisplayOrder());
        response.setIsActive(group.getIsActive());
        response.setCreatedAt(group.getCreatedAt());
        response.setUpdatedAt(group.getUpdatedAt());
        response.setDepartmentName(group.getDepartmentName());
        response.setLeaderName(group.getLeaderName());
        return response;
    }
}
