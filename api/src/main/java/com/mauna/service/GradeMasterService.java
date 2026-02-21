package com.mauna.service;

import com.mauna.domain.GradeMaster;
import com.mauna.repository.GradeMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class GradeMasterService {

    @Autowired
    private GradeMasterRepository gradeMasterRepository;

    public List<GradeMaster> getAllGradeMasters() {
        return gradeMasterRepository.findAll();
    }

    public GradeMaster getGradeMasterById(Long id) {
        return gradeMasterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GradeMaster not found: " + id));
    }

    public Optional<GradeMaster> getGradeMasterByGradeAndSubGrade(Integer grade, String subGrade) {
        return gradeMasterRepository.findByGradeAndSubGrade(grade, subGrade);
    }
}
