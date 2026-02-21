package com.mauna.dto;

import com.mauna.domain.GradeMaster;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GradeMasterResponse {
    private Long id;
    private Integer grade;
    private String subGrade;
    private String name;
    private BigDecimal costRate;

    public static GradeMasterResponse fromDomain(GradeMaster gradeMaster) {
        GradeMasterResponse response = new GradeMasterResponse();
        response.setId(gradeMaster.getId());
        response.setGrade(gradeMaster.getGrade());
        response.setSubGrade(gradeMaster.getSubGrade());
        response.setName(gradeMaster.getName());
        response.setCostRate(gradeMaster.getCostRate());
        return response;
    }
}
