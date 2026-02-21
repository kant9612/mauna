package com.mauna.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GrossProfitTrendResponse {
    private String yearMonth;
    private Long id;
    private String name;
    private String parentName;
    private BigDecimal confirmedRevenue;
    private BigDecimal estimatedRevenue;
    private BigDecimal totalRevenue;
    private BigDecimal confirmedCost;
    private BigDecimal estimatedCost;
    private BigDecimal totalCost;
    private BigDecimal confirmedProfit;
    private BigDecimal estimatedProfit;
    private BigDecimal totalProfit;
}
