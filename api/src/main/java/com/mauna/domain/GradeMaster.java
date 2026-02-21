package com.mauna.domain;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class GradeMaster {
    private Long id;
    private Integer grade;
    private String subGrade;
    private String name;
    private BigDecimal costRate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
