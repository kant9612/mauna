package com.mauna.repository;

import com.mauna.domain.GradeMaster;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface GradeMasterRepository {
    List<GradeMaster> findAll();
    Optional<GradeMaster> findById(@Param("id") Long id);
    Optional<GradeMaster> findByGradeAndSubGrade(@Param("grade") Integer grade, @Param("subGrade") String subGrade);
}
