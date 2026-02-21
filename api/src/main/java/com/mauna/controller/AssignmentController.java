package com.mauna.controller;

import com.mauna.domain.Assignment;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.EngineerResponse;
import com.mauna.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<Assignment>> getAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    /**
     * 入場予定一覧
     * GET /assignments/upcoming-entries?from=2024-07-01&to=2024-12-31
     */
    @GetMapping("/upcoming-entries")
    public ResponseEntity<List<AssignmentScheduleResponse>> getUpcomingEntries(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(assignmentService.getUpcomingEntries(from, to));
    }

    /**
     * 退場予定一覧
     * GET /assignments/upcoming-exits?from=2024-07-01&to=2024-12-31
     */
    @GetMapping("/upcoming-exits")
    public ResponseEntity<List<AssignmentScheduleResponse>> getUpcomingExits(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(assignmentService.getUpcomingExits(from, to));
    }

    /**
     * 入退場スケジュール（カレンダー表示用）
     * GET /assignments/schedule?from=2024-07-01&to=2024-12-31
     */
    @GetMapping("/schedule")
    public ResponseEntity<List<AssignmentScheduleResponse>> getSchedule(
            @RequestParam String from,
            @RequestParam String to) {
        return ResponseEntity.ok(assignmentService.getSchedule(from, to));
    }

    /**
     * 待機メンバー一覧（指定日時点で案件にアサインされていないエンジニア）
     * GET /assignments/standby-engineers?date=2025-01-28
     */
    @GetMapping("/standby-engineers")
    public ResponseEntity<List<EngineerResponse>> getStandbyEngineers(
            @RequestParam String date) {
        return ResponseEntity.ok(assignmentService.getStandbyEngineers(date));
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(@PathVariable Long id, @RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, assignment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }
}
