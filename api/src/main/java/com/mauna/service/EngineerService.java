package com.mauna.service;

import com.mauna.domain.Engineer;
import com.mauna.domain.GradeMaster;
import com.mauna.repository.AssignmentRepository;
import com.mauna.repository.EngineerGradeHistoryRepository;
import com.mauna.repository.EngineerRepository;
import com.mauna.repository.GradeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EngineerService {

    @Autowired
    private EngineerRepository engineerRepository;

    @Autowired
    private EngineerGradeHistoryRepository engineerGradeHistoryRepository;

    @Autowired
    private GradeMasterRepository gradeMasterRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    public List<Engineer> getAllEngineers() {
        return engineerRepository.findAll();
    }

    public Engineer getEngineerById(Long id) {
        return engineerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Engineer not found: " + id));
    }

    public Engineer createEngineer(Engineer engineer) {
        engineerRepository.insert(engineer);
        return engineerRepository.findById(engineer.getId())
                .orElseThrow(() -> new RuntimeException("Engineer not found: " + engineer.getId()));
    }

    public Engineer updateEngineer(Long id, Engineer engineer) {
        Engineer existingEngineer = engineerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Engineer not found: " + id));

        engineer.setId(id);
        engineerRepository.update(engineer);

        // 等級が変更された場合、既存のACTIVEなAssignmentのcostRateを更新
        boolean gradeChanged = !equalsNullSafe(existingEngineer.getGrade(), engineer.getGrade())
                || !equalsNullSafe(existingEngineer.getSubGrade(), engineer.getSubGrade());

        if (gradeChanged && engineer.getGrade() != null && engineer.getSubGrade() != null) {
            LocalDate today = LocalDate.now();

            // 1. 現在の履歴レコードを閉じる（effective_to = 昨日）
            engineerGradeHistoryRepository.closeCurrentGrade(id, today.minusDays(1));

            // 2. 新しい履歴レコードを追加（effective_from = 今日）
            engineerGradeHistoryRepository.insert(id, engineer.getGrade(), engineer.getSubGrade(), today);

            // 3. Assignmentの原価更新
            Optional<GradeMaster> gradeMaster = gradeMasterRepository.findByGradeAndSubGrade(
                    engineer.getGrade(), engineer.getSubGrade());
            if (gradeMaster.isPresent()) {
                BigDecimal costRate = gradeMaster.get().getCostRate();
                assignmentRepository.updateCostRateByEngineerId(id, costRate);
            }
        }

        return engineerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Engineer not found: " + id));
    }

    public void deleteEngineer(Long id) {
        engineerRepository.deleteById(id);
    }

    private boolean equalsNullSafe(Object a, Object b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
