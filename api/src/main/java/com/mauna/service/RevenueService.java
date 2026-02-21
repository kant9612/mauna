package com.mauna.service;

import com.mauna.domain.Revenue;
import com.mauna.dto.RevenueSummaryResponse;
import com.mauna.dto.MonthlyRevenueResponse;
import com.mauna.dto.RevenueForecastResponse;
import com.mauna.dto.GrossProfitTrendResponse;
import com.mauna.repository.RevenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RevenueService {

    @Autowired
    private RevenueRepository revenueRepository;

    public List<Revenue> getAllRevenues() {
        return revenueRepository.findAll();
    }

    public List<Revenue> getRevenuesByYearMonth(String yearMonth) {
        return revenueRepository.findByYearMonth(yearMonth);
    }

    public Revenue getRevenueById(Long id) {
        return revenueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Revenue not found: " + id));
    }

    // 部別集計
    public List<RevenueSummaryResponse> summarizeByDepartment(String yearMonth, String from, String to) {
        if (yearMonth != null && !yearMonth.isEmpty()) {
            return revenueRepository.summarizeByDepartment(yearMonth);
        } else if (from != null && to != null) {
            return revenueRepository.summarizeByDepartmentRange(from, to);
        }
        throw new IllegalArgumentException("yearMonth or (from, to) must be specified");
    }

    // グループ別集計
    public List<RevenueSummaryResponse> summarizeByGroup(String yearMonth, String from, String to) {
        if (yearMonth != null && !yearMonth.isEmpty()) {
            return revenueRepository.summarizeByGroup(yearMonth);
        } else if (from != null && to != null) {
            return revenueRepository.summarizeByGroupRange(from, to);
        }
        throw new IllegalArgumentException("yearMonth or (from, to) must be specified");
    }

    // エンジニア別集計
    public List<RevenueSummaryResponse> summarizeByEngineer(String yearMonth, String from, String to) {
        if (yearMonth != null && !yearMonth.isEmpty()) {
            return revenueRepository.summarizeByEngineer(yearMonth);
        } else if (from != null && to != null) {
            return revenueRepository.summarizeByEngineerRange(from, to);
        }
        throw new IllegalArgumentException("yearMonth or (from, to) must be specified");
    }

    // 月次推移
    public List<MonthlyRevenueResponse> getMonthlyTrend(String from, String to) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from and to must be specified");
        }
        return revenueRepository.getMonthlyTrend(from, to);
    }

    public Revenue createRevenue(Revenue revenue) {
        revenueRepository.insert(revenue);
        return revenue;
    }

    public Revenue updateRevenue(Long id, Revenue revenue) {
        revenueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Revenue not found: " + id));
        revenue.setId(id);
        revenueRepository.update(revenue);
        return revenue;
    }

    public void deleteRevenue(Long id) {
        revenueRepository.deleteById(id);
    }

    // 月次売上予測
    public List<RevenueForecastResponse> forecastByDepartment(String yearMonth) {
        if (yearMonth == null || yearMonth.isEmpty()) {
            throw new IllegalArgumentException("yearMonth must be specified");
        }
        return revenueRepository.forecastByDepartment(yearMonth);
    }

    public List<RevenueForecastResponse> forecastByGroup(String yearMonth) {
        if (yearMonth == null || yearMonth.isEmpty()) {
            throw new IllegalArgumentException("yearMonth must be specified");
        }
        return revenueRepository.forecastByGroup(yearMonth);
    }

    public List<RevenueForecastResponse> forecastByEngineer(String yearMonth) {
        if (yearMonth == null || yearMonth.isEmpty()) {
            throw new IllegalArgumentException("yearMonth must be specified");
        }
        return revenueRepository.forecastByEngineer(yearMonth);
    }

    // 粗利推移
    public List<GrossProfitTrendResponse> getGrossProfitTrend(String from, String to, String groupBy) {
        if (from == null || to == null) {
            throw new IllegalArgumentException("from and to must be specified");
        }
        switch (groupBy) {
            case "department":
                return revenueRepository.getGrossProfitTrendByDepartment(from, to);
            case "group":
                return revenueRepository.getGrossProfitTrendByGroup(from, to);
            case "total":
            default:
                return revenueRepository.getGrossProfitTrendTotal(from, to);
        }
    }
}
