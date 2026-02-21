package com.mauna.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AssignmentScheduleResponse {
    private Long assignmentId;
    private Long engineerId;
    private String engineerName;
    private String groupName;
    private String departmentName;
    private Long projectId;
    private String projectName;
    private String customerName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String role;
    private String status;
    private BigDecimal billingRate;
}
