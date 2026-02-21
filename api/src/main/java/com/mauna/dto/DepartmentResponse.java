package com.mauna.dto;

import com.mauna.domain.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private Long directorId;
    private String directorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GroupResponse> groups;

    public static DepartmentResponse fromDomain(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setCode(department.getCode());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setDisplayOrder(department.getDisplayOrder());
        response.setIsActive(department.getIsActive());
        response.setDirectorId(department.getDirectorId());
        response.setDirectorName(department.getDirectorName());
        response.setCreatedAt(department.getCreatedAt());
        response.setUpdatedAt(department.getUpdatedAt());
        if (department.getGroups() != null) {
            response.setGroups(department.getGroups().stream()
                    .map(GroupResponse::fromDomain)
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
