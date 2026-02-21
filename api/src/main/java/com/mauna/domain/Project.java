package com.mauna.domain;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class Project {
    private Long id;
    private Long customerId;
    private String projectCode;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private String billingType;
    private BigDecimal unitPrice;
    private Integer requiredHeadcount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal totalBillingRate;  // メンバー単価合計（集計用）
}
