package com.mauna.controller;

import com.mauna.domain.Engineer;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.EngineerRequest;
import com.mauna.dto.EngineerResponse;
import com.mauna.service.AssignmentService;
import com.mauna.service.EngineerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/engineers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class EngineerController {

    @Autowired
    private EngineerService engineerService;

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<List<EngineerResponse>> getAllEngineers() {
        List<Engineer> engineers = engineerService.getAllEngineers();
        List<EngineerResponse> response = engineers.stream()
                .map(EngineerResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EngineerResponse> getEngineerById(@PathVariable Long id) {
        Engineer engineer = engineerService.getEngineerById(id);
        return ResponseEntity.ok(EngineerResponse.fromDomain(engineer));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EngineerResponse> createEngineer(@RequestBody EngineerRequest request) {
        Engineer engineer = new Engineer();
        engineer.setEmployeeNumber(request.getEmployeeNumber());
        engineer.setName(request.getName());
        engineer.setEmail(request.getEmail());
        engineer.setPhone(request.getPhone());
        engineer.setSkillSet(request.getSkillSet());
        engineer.setExperienceYears(request.getExperienceYears());
        engineer.setExperienceMonths(request.getExperienceMonths());
        engineer.setEmploymentStatus(request.getEmploymentStatus());
        engineer.setGroupId(request.getGroupId());
        engineer.setGrade(request.getGrade());
        engineer.setSubGrade(request.getSubGrade());

        Engineer created = engineerService.createEngineer(engineer);
        return ResponseEntity.ok(EngineerResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EngineerResponse> updateEngineer(@PathVariable Long id, @RequestBody EngineerRequest request) {
        Engineer engineer = new Engineer();
        engineer.setEmployeeNumber(request.getEmployeeNumber());
        engineer.setName(request.getName());
        engineer.setEmail(request.getEmail());
        engineer.setPhone(request.getPhone());
        engineer.setSkillSet(request.getSkillSet());
        engineer.setExperienceYears(request.getExperienceYears());
        engineer.setExperienceMonths(request.getExperienceMonths());
        engineer.setEmploymentStatus(request.getEmploymentStatus());
        engineer.setGroupId(request.getGroupId());
        engineer.setGrade(request.getGrade());
        engineer.setSubGrade(request.getSubGrade());

        Engineer updated = engineerService.updateEngineer(id, engineer);
        return ResponseEntity.ok(EngineerResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEngineer(@PathVariable Long id) {
        engineerService.deleteEngineer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/assignments")
    public ResponseEntity<List<AssignmentScheduleResponse>> getEngineerAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByEngineerId(id));
    }
}
