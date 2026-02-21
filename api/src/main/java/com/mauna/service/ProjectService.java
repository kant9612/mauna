package com.mauna.service;

import com.mauna.domain.Project;
import com.mauna.dto.ResourceShortageAlert;
import com.mauna.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private static final String CODE_PREFIX = "PRJ";
    private static final int MAX_RETRY = 3;

    @Autowired
    private ProjectRepository projectRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    @Transactional(noRollbackFor = DuplicateKeyException.class)
    public Project createProject(Project project) {
        for (int retry = 0; retry < MAX_RETRY; retry++) {
            String nextCode = generateNextCode();
            project.setProjectCode(nextCode);
            try {
                projectRepository.insert(project);
                return project;
            } catch (DuplicateKeyException e) {
                if (retry == MAX_RETRY - 1) {
                    throw new RuntimeException("Failed to generate unique project code", e);
                }
            }
        }
        return project;
    }

    private String generateNextCode() {
        String maxCode = projectRepository.findMaxProjectCode();
        int nextNumber = 1;
        if (maxCode != null && maxCode.startsWith(CODE_PREFIX)) {
            try {
                nextNumber = Integer.parseInt(maxCode.substring(CODE_PREFIX.length())) + 1;
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        return String.format("%s%03d", CODE_PREFIX, nextNumber);
    }

    @Transactional
    public Project updateProject(Long id, Project project) {
        Project existing = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
        project.setId(id);
        project.setProjectCode(existing.getProjectCode());
        projectRepository.update(project);
        return project;
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }

    public List<ResourceShortageAlert> getResourceShortages() {
        return projectRepository.findResourceShortages();
    }
}
