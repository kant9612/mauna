package com.mauna.service;

import com.mauna.domain.Engineer;
import com.mauna.domain.Group;
import com.mauna.repository.DepartmentRepository;
import com.mauna.repository.EngineerRepository;
import com.mauna.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private EngineerRepository engineerRepository;

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public List<Group> getGroupsByDepartmentId(Long departmentId) {
        return groupRepository.findByDepartmentId(departmentId);
    }

    public Group getGroupById(Long id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
    }

    public Group createGroup(Group group) {
        if (!departmentRepository.existsById(group.getDepartmentId())) {
            throw new RuntimeException("Department not found: " + group.getDepartmentId());
        }
        if (groupRepository.findByCode(group.getCode()).isPresent()) {
            throw new RuntimeException("Group code already exists: " + group.getCode());
        }
        if (group.getLeaderId() != null && !engineerRepository.findById(group.getLeaderId()).isPresent()) {
            throw new RuntimeException("Leader (Engineer) not found: " + group.getLeaderId());
        }
        if (group.getDisplayOrder() == null) {
            group.setDisplayOrder(0);
        }
        if (group.getIsActive() == null) {
            group.setIsActive(true);
        }
        groupRepository.insert(group);
        return groupRepository.findById(group.getId()).orElse(group);
    }

    public Group updateGroup(Long id, Group group) {
        if (!groupRepository.existsById(id)) {
            throw new RuntimeException("Group not found: " + id);
        }
        if (!departmentRepository.existsById(group.getDepartmentId())) {
            throw new RuntimeException("Department not found: " + group.getDepartmentId());
        }
        groupRepository.findByCode(group.getCode())
                .ifPresent(g -> {
                    if (!g.getId().equals(id)) {
                        throw new RuntimeException("Group code already exists: " + group.getCode());
                    }
                });
        if (group.getLeaderId() != null && !engineerRepository.findById(group.getLeaderId()).isPresent()) {
            throw new RuntimeException("Leader (Engineer) not found: " + group.getLeaderId());
        }

        group.setId(id);
        groupRepository.update(group);
        return groupRepository.findById(id).orElse(group);
    }

    public Group updateLeader(Long id, Long leaderId) {
        if (!groupRepository.existsById(id)) {
            throw new RuntimeException("Group not found: " + id);
        }
        if (leaderId != null && !engineerRepository.findById(leaderId).isPresent()) {
            throw new RuntimeException("Leader (Engineer) not found: " + leaderId);
        }
        groupRepository.updateLeader(id, leaderId);
        return groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found: " + id));
    }

    public void deleteGroup(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new RuntimeException("Group not found: " + id);
        }
        groupRepository.deleteById(id);
    }

    public List<Engineer> getGroupMembers(Long groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found: " + groupId);
        }
        return groupRepository.findMembersByGroupId(groupId);
    }
}
