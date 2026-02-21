package com.mauna.service;

import com.mauna.domain.Assignment;
import com.mauna.domain.Engineer;
import com.mauna.domain.GradeMaster;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.EngineerResponse;
import com.mauna.repository.AssignmentRepository;
import com.mauna.repository.EngineerRepository;
import com.mauna.repository.GradeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private EngineerRepository engineerRepository;

    @Autowired
    private GradeMasterRepository gradeMasterRepository;

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + id));
    }

    /**
     * 入場予定一覧を取得
     * @param from 開始日（YYYY-MM-DD形式）
     * @param to 終了日（YYYY-MM-DD形式）
     */
    public List<AssignmentScheduleResponse> getUpcomingEntries(String from, String to) {
        validateDateRange(from, to);
        return assignmentRepository.findUpcomingEntries(from, to);
    }

    /**
     * 退場予定一覧を取得
     * @param from 開始日（YYYY-MM-DD形式）
     * @param to 終了日（YYYY-MM-DD形式）
     */
    public List<AssignmentScheduleResponse> getUpcomingExits(String from, String to) {
        validateDateRange(from, to);
        return assignmentRepository.findUpcomingExits(from, to);
    }

    /**
     * 入退場スケジュールを取得（カレンダー表示用）
     * @param from 開始日（YYYY-MM-DD形式）
     * @param to 終了日（YYYY-MM-DD形式）
     */
    public List<AssignmentScheduleResponse> getSchedule(String from, String to) {
        validateDateRange(from, to);
        return assignmentRepository.findSchedule(from, to);
    }

    public Assignment createAssignment(Assignment assignment) {
        // エンジニアの等級から原価を自動設定
        if (assignment.getEngineerId() != null) {
            Optional<Engineer> engineerOpt = engineerRepository.findById(assignment.getEngineerId());
            if (engineerOpt.isPresent()) {
                Engineer engineer = engineerOpt.get();
                if (engineer.getGrade() != null && engineer.getSubGrade() != null) {
                    Optional<GradeMaster> gradeMaster = gradeMasterRepository.findByGradeAndSubGrade(
                            engineer.getGrade(), engineer.getSubGrade());
                    gradeMaster.ifPresent(gm -> assignment.setCostRate(gm.getCostRate()));
                }
            }
        }
        assignmentRepository.insert(assignment);
        return assignment;
    }

    public Assignment updateAssignment(Long id, Assignment assignment) {
        assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found: " + id));
        assignment.setId(id);
        assignmentRepository.update(assignment);
        return assignment;
    }

    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }

    /**
     * 案件別アサイン一覧を取得
     * @param projectId 案件ID
     */
    public List<AssignmentScheduleResponse> getAssignmentsByProjectId(Long projectId) {
        return assignmentRepository.findByProjectId(projectId);
    }

    /**
     * 待機メンバー一覧を取得（指定日時点で案件にアサインされていないエンジニア）
     * @param date 基準日（YYYY-MM-DD形式）
     */
    public List<EngineerResponse> getStandbyEngineers(String date) {
        if (date == null || date.isEmpty()) {
            throw new IllegalArgumentException("date must be specified");
        }
        return assignmentRepository.findStandbyEngineers(date);
    }

    /**
     * エンジニア別アサイン履歴を取得
     * @param engineerId エンジニアID
     */
    public List<AssignmentScheduleResponse> getAssignmentsByEngineerId(Long engineerId) {
        return assignmentRepository.findByEngineerId(engineerId);
    }

    private void validateDateRange(String from, String to) {
        if (from == null || from.isEmpty() || to == null || to.isEmpty()) {
            throw new IllegalArgumentException("from and to must be specified");
        }
    }
}
