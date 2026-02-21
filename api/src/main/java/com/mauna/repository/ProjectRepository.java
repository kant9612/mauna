package com.mauna.repository;

import com.mauna.domain.Project;
import com.mauna.dto.ResourceShortageAlert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ProjectRepository {
    List<Project> findAll();
    Optional<Project> findById(@Param("id") Long id);
    void insert(Project project);
    void update(Project project);
    void deleteById(@Param("id") Long id);
    String findMaxProjectCode();

    // リソース不足アラート
    List<ResourceShortageAlert> findResourceShortages();
}
