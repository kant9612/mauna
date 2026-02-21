package com.mauna.domain;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Assignment {
    private Long id;
    private Long projectId;
    private Long engineerId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String role;
    private BigDecimal billingRate;
    private BigDecimal costRate;
    private BigDecimal workingHoursPerMonth;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
