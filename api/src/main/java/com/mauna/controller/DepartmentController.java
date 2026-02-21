package com.mauna.controller;

import com.mauna.domain.Department;
import com.mauna.dto.DepartmentRequest;
import com.mauna.dto.DepartmentResponse;
import com.mauna.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/departments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAllDepartments(
            @RequestParam(required = false, defaultValue = "false") boolean includeGroups) {
        List<Department> departments;
        if (includeGroups) {
            departments = departmentService.getAllDepartmentsWithGroups();
        } else {
            departments = departmentService.getAllDepartments();
        }
        List<DepartmentResponse> response = departments.stream()
                .map(DepartmentResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartmentById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean includeGroups) {
        Department department;
        if (includeGroups) {
            department = departmentService.getDepartmentByIdWithGroups(id);
        } else {
            department = departmentService.getDepartmentById(id);
        }
        return ResponseEntity.ok(DepartmentResponse.fromDomain(department));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> createDepartment(@RequestBody DepartmentRequest request) {
        Department department = new Department();
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setDisplayOrder(request.getDisplayOrder());
        department.setIsActive(request.getIsActive());

        Department created = departmentService.createDepartment(department);
        return ResponseEntity.ok(DepartmentResponse.fromDomain(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id, @RequestBody DepartmentRequest request) {
        Department department = new Department();
        department.setCode(request.getCode());
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        department.setDisplayOrder(request.getDisplayOrder());
        department.setIsActive(request.getIsActive());

        Department updated = departmentService.updateDepartment(id, department);
        return ResponseEntity.ok(DepartmentResponse.fromDomain(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }
}
