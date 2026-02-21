package com.mauna.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

@Mapper
public interface EngineerGradeHistoryRepository {
    void closeCurrentGrade(@Param("engineerId") Long engineerId, @Param("effectiveTo") LocalDate effectiveTo);
    void insert(@Param("engineerId") Long engineerId, @Param("grade") Integer grade, @Param("subGrade") String subGrade, @Param("effectiveFrom") LocalDate effectiveFrom);
}
