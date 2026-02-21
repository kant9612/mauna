package com.mauna.repository;

import com.mauna.domain.Revenue;
import com.mauna.dto.RevenueSummaryResponse;
import com.mauna.dto.MonthlyRevenueResponse;
import com.mauna.dto.RevenueForecastResponse;
import com.mauna.dto.GrossProfitTrendResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface RevenueRepository {
    List<Revenue> findAll();
    List<Revenue> findByYearMonth(@Param("yearMonth") String yearMonth);
    Optional<Revenue> findById(@Param("id") Long id);

    // 部別集計
    List<RevenueSummaryResponse> summarizeByDepartment(@Param("yearMonth") String yearMonth);
    List<RevenueSummaryResponse> summarizeByDepartmentRange(@Param("from") String from, @Param("to") String to);

    // グループ別集計
    List<RevenueSummaryResponse> summarizeByGroup(@Param("yearMonth") String yearMonth);
    List<RevenueSummaryResponse> summarizeByGroupRange(@Param("from") String from, @Param("to") String to);

    // エンジニア別集計
    List<RevenueSummaryResponse> summarizeByEngineer(@Param("yearMonth") String yearMonth);
    List<RevenueSummaryResponse> summarizeByEngineerRange(@Param("from") String from, @Param("to") String to);

    // 月次推移
    List<MonthlyRevenueResponse> getMonthlyTrend(@Param("from") String from, @Param("to") String to);

    void insert(Revenue revenue);
    void update(Revenue revenue);
    void deleteById(@Param("id") Long id);

    // 月次売上予測
    List<RevenueForecastResponse> forecastByDepartment(@Param("yearMonth") String yearMonth);
    List<RevenueForecastResponse> forecastByGroup(@Param("yearMonth") String yearMonth);
    List<RevenueForecastResponse> forecastByEngineer(@Param("yearMonth") String yearMonth);

    // 粗利推移
    List<GrossProfitTrendResponse> getGrossProfitTrendTotal(@Param("from") String from, @Param("to") String to);
    List<GrossProfitTrendResponse> getGrossProfitTrendByDepartment(@Param("from") String from, @Param("to") String to);
    List<GrossProfitTrendResponse> getGrossProfitTrendByGroup(@Param("from") String from, @Param("to") String to);
}
