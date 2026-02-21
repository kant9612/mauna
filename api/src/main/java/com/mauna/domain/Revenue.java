package com.mauna.domain;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Revenue {
    private Long id;
    private String yearMonth;
    private Long assignmentId;
    private BigDecimal revenue;
    private BigDecimal cost;
    private BigDecimal profit;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
