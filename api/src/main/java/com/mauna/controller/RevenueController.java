package com.mauna.controller;

import com.mauna.domain.Revenue;
import com.mauna.dto.RevenueSummaryResponse;
import com.mauna.dto.MonthlyRevenueResponse;
import com.mauna.dto.RevenueForecastResponse;
import com.mauna.dto.GrossProfitTrendResponse;
import com.mauna.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/revenues")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    @GetMapping
    public ResponseEntity<List<Revenue>> getRevenues(
            @RequestParam(required = false) String yearMonth) {
        if (yearMonth != null && !yearMonth.isEmpty()) {
            return ResponseEntity.ok(revenueService.getRevenuesByYearMonth(yearMonth));
        }
        return ResponseEntity.ok(revenueService.getAllRevenues());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Revenue> getRevenueById(@PathVariable Long id) {
        return ResponseEntity.ok(revenueService.getRevenueById(id));
    }

    @GetMapping("/summary/by-department")
    public ResponseEntity<List<RevenueSummaryResponse>> summarizeByDepartment(
            @RequestParam(required = false) String yearMonth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(revenueService.summarizeByDepartment(yearMonth, from, to));
    }

    @GetMapping("/summary/by-group")
    public ResponseEntity<List<RevenueSummaryResponse>> summarizeByGroup(
            @RequestParam(required = false) String yearMonth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(revenueService.summarizeByGroup(yearMonth, from, to));
    }

    @GetMapping("/summary/by-engineer")
    public ResponseEntity<List<RevenueSummaryResponse>> summarizeByEngineer(
            @RequestParam(required = false) String yearMonth,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(revenueService.summarizeByEngineer(yearMonth, from, to));
    }

    @GetMapping("/summary/monthly")
    public ResponseEntity<List<MonthlyRevenueResponse>> getMonthlyTrend(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(revenueService.getMonthlyTrend(from, to));
    }

    @PostMapping
    public ResponseEntity<Revenue> createRevenue(@RequestBody Revenue revenue) {
        return ResponseEntity.ok(revenueService.createRevenue(revenue));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Revenue> updateRevenue(@PathVariable Long id, @RequestBody Revenue revenue) {
        return ResponseEntity.ok(revenueService.updateRevenue(id, revenue));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRevenue(@PathVariable Long id) {
        revenueService.deleteRevenue(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<RevenueForecastResponse>> getForecast(
            @RequestParam String yearMonth,
            @RequestParam(required = false, defaultValue = "department") String groupBy) {
        List<RevenueForecastResponse> result;
        switch (groupBy) {
            case "group":
                result = revenueService.forecastByGroup(yearMonth);
                break;
            case "engineer":
                result = revenueService.forecastByEngineer(yearMonth);
                break;
            case "department":
            default:
                result = revenueService.forecastByDepartment(yearMonth);
                break;
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grossProfitTrend")
    public ResponseEntity<List<GrossProfitTrendResponse>> getGrossProfitTrend(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false, defaultValue = "total") String groupBy) {
        return ResponseEntity.ok(revenueService.getGrossProfitTrend(from, to, groupBy));
    }
}
