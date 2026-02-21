package com.mauna.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberAssignmentResponse {
    private Long groupId;
    private String groupName;
    private List<ProjectAssignment> projects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectAssignment {
        private Long projectId;
        private String projectName;
        private String customerName;
        private List<MemberAssignment> members;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberAssignment {
        private Long engineerId;
        private String engineerName;
        private String role;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
