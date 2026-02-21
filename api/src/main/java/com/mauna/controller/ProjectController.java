package com.mauna.controller;

import com.mauna.domain.Project;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.ResourceShortageAlert;
import com.mauna.service.AssignmentService;
import com.mauna.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectService.createProject(project));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody Project project) {
        return ResponseEntity.ok(projectService.updateProject(id, project));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alerts/resource-shortage")
    public ResponseEntity<List<ResourceShortageAlert>> getResourceShortages() {
        return ResponseEntity.ok(projectService.getResourceShortages());
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<AssignmentScheduleResponse>> getProjectMembers(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProjectId(id));
    }
}
