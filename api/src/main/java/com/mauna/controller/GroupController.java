package com.mauna.controller;

import com.mauna.domain.Engineer;
import com.mauna.domain.Group;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.EngineerResponse;
import com.mauna.dto.GroupMemberAssignmentResponse;
import com.mauna.dto.GroupRequest;
import com.mauna.dto.GroupResponse;
import com.mauna.repository.AssignmentRepository;
import com.mauna.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/groups")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getAllGroups(
            @RequestParam(required = false) Long departmentId) {
        List<Group> groups;
        if (departmentId != null) {
            groups = groupService.getGroupsByDepartmentId(departmentId);
        } else {
            groups = groupService.getAllGroups();
        }
        List<GroupResponse> response = groups.stream()
                .map(GroupResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable Long id) {
        Group group = groupService.getGroupById(id);
        return ResponseEntity.ok(GroupResponse.fromDomain(group));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponse> createGroup(@RequestBody GroupRequest request) {
        Group group = new Group();
        group.setDepartmentId(request.getDepartmentId());
        group.setCode(request.getCode());
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setLeaderId(request.getLeaderId());
        group.setDisplayOrder(request.getDisplayOrder());
        group.setIsActive(request.getIsActive());

        Group created = groupService.createGroup(group);
        return ResponseEntity.ok(GroupResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponse> updateGroup(@PathVariable Long id, @RequestBody GroupRequest request) {
        Group group = new Group();
        group.setDepartmentId(request.getDepartmentId());
        group.setCode(request.getCode());
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setLeaderId(request.getLeaderId());
        group.setDisplayOrder(request.getDisplayOrder());
        group.setIsActive(request.getIsActive());

        Group updated = groupService.updateGroup(id, group);
        return ResponseEntity.ok(GroupResponse.fromDomain(updated));
    }

    @PutMapping("/{id}/leader")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupResponse> updateLeader(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long leaderId = request.get("leaderId");
        Group updated = groupService.updateLeader(id, leaderId);
        return ResponseEntity.ok(GroupResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<EngineerResponse>> getGroupMembers(@PathVariable Long id) {
        List<Engineer> members = groupService.getGroupMembers(id);
        List<EngineerResponse> response = members.stream()
                .map(EngineerResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/member-assignments")
    public ResponseEntity<GroupMemberAssignmentResponse> getMemberAssignments(
            @PathVariable Long id,
            @RequestParam String from,
            @RequestParam String to) {

        Group group = groupService.getGroupById(id);
        List<AssignmentScheduleResponse> assignments = assignmentRepository.findByGroupId(id, from, to);

        // プロジェクト単位でグループ化
        Map<Long, GroupMemberAssignmentResponse.ProjectAssignment> projectMap = new LinkedHashMap<>();

        for (AssignmentScheduleResponse a : assignments) {
            GroupMemberAssignmentResponse.ProjectAssignment project = projectMap.computeIfAbsent(
                a.getProjectId(),
                k -> new GroupMemberAssignmentResponse.ProjectAssignment(
                    a.getProjectId(),
                    a.getProjectName(),
                    a.getCustomerName(),
                    new ArrayList<>()
                )
            );

            project.getMembers().add(new GroupMemberAssignmentResponse.MemberAssignment(
                a.getEngineerId(),
                a.getEngineerName(),
                a.getRole(),
                a.getStartDate(),
                a.getEndDate()
            ));
        }

        GroupMemberAssignmentResponse response = new GroupMemberAssignmentResponse(
            group.getId(),
            group.getName(),
            new ArrayList<>(projectMap.values())
        );

        return ResponseEntity.ok(response);
    }
}
