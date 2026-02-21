package com.mauna.repository;

import com.mauna.domain.Engineer;
import com.mauna.domain.Group;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface GroupRepository {
    List<Group> findAll();
    List<Group> findByDepartmentId(@Param("departmentId") Long departmentId);
    Optional<Group> findById(@Param("id") Long id);
    Optional<Group> findByCode(@Param("code") String code);
    void insert(Group group);
    void update(Group group);
    void updateLeader(@Param("id") Long id, @Param("leaderId") Long leaderId);
    void deleteById(@Param("id") Long id);
    boolean existsById(@Param("id") Long id);
    int countByDepartmentId(@Param("departmentId") Long departmentId);
    List<Engineer> findMembersByGroupId(@Param("groupId") Long groupId);
}
