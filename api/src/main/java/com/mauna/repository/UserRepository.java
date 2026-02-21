package com.mauna.repository;

import com.mauna.domain.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface UserRepository {
    Optional<User> findByUsername(@Param("username") String username);
    Optional<User> findById(@Param("id") Long id);
}
