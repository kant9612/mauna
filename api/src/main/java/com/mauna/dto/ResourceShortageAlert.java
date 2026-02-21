package com.mauna.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ResourceShortageAlert {
    private Long projectId;
    private String projectName;
    private String customerName;
    private String projectStatus;
    private Integer requiredHeadcount;
    private Integer assignedCount;
    private Integer shortage;
    private LocalDate projectStartDate;
    private LocalDate projectEndDate;
}
