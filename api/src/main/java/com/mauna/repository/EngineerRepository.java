package com.mauna.repository;

import com.mauna.domain.Engineer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface EngineerRepository {
    List<Engineer> findAll();
    Optional<Engineer> findById(@Param("id") Long id);
    void insert(Engineer engineer);
    void update(Engineer engineer);
    void deleteById(@Param("id") Long id);
}
