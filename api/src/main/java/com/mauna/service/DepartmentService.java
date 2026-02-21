package com.mauna.service;

import com.mauna.domain.Department;
import com.mauna.repository.DepartmentRepository;
import com.mauna.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private GroupRepository groupRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getAllDepartmentsWithGroups() {
        return departmentRepository.findAllWithGroups();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
    }

    public Department getDepartmentByIdWithGroups(Long id) {
        return departmentRepository.findByIdWithGroups(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));
    }

    public Department createDepartment(Department department) {
        if (departmentRepository.findByCode(department.getCode()).isPresent()) {
            throw new RuntimeException("Department code already exists: " + department.getCode());
        }
        if (department.getDisplayOrder() == null) {
            department.setDisplayOrder(0);
        }
        if (department.getIsActive() == null) {
            department.setIsActive(true);
        }
        departmentRepository.insert(department);
        return department;
    }

    public Department updateDepartment(Long id, Department department) {
        Department existing = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found: " + id));

        departmentRepository.findByCode(department.getCode())
                .ifPresent(d -> {
                    if (!d.getId().equals(id)) {
                        throw new RuntimeException("Department code already exists: " + department.getCode());
                    }
                });

        department.setId(id);
        departmentRepository.update(department);
        return departmentRepository.findById(id).orElse(department);
    }

    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found: " + id);
        }
        int groupCount = groupRepository.countByDepartmentId(id);
        if (groupCount > 0) {
            throw new RuntimeException("Cannot delete department with existing groups. Please delete all groups first.");
        }
        departmentRepository.deleteById(id);
    }
}
