package com.mauna.repository;

import com.mauna.domain.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface DepartmentRepository {
    List<Department> findAll();
    List<Department> findAllWithGroups();
    Optional<Department> findById(@Param("id") Long id);
    Optional<Department> findByIdWithGroups(@Param("id") Long id);
    Optional<Department> findByCode(@Param("code") String code);
    void insert(Department department);
    void update(Department department);
    void deleteById(@Param("id") Long id);
    boolean existsById(@Param("id") Long id);
}
